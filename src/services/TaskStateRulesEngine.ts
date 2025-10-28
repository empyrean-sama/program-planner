/**
 * TASK STATE RULES ENGINE
 * 
 * This engine automatically manages task states based on predefined rules.
 * 
 * STATE TRANSITION RULES:
 * =======================
 * 
 * 1. FILED (Initial State)
 *    - All tasks start in this state when created
 *    - System can transition to: SCHEDULED, DOING, FAILED
 *    - User can transition to: REMOVED, FINISHED, DEFERRED, FAILED
 * 
 * 2. SCHEDULED (System-Managed)
 *    - Task has at least one schedule entry
 *    - System can transition to: DOING, FAILED
 *    - User can transition to: REMOVED, FINISHED, DEFERRED, FAILED
 * 
 * 3. DOING (System-Managed)
 *    - Task has a schedule entry for today (any time today)
 *    - System can transition to: FAILED
 *    - User can transition to: REMOVED, FINISHED, DEFERRED, FAILED
 * 
 * 4. FAILED (System or User-Managed)
 *    - Auto-set if due date + 1 day has passed without user setting a final state
 *    - User can also manually set this state
 *    - FINAL STATE: System cannot change once set
 * 
 * 5. FINISHED (User-Only)
 *    - User marks task as complete
 *    - FINAL STATE: System cannot change once set
 * 
 * 6. DEFERRED (User-Only)
 *    - User postpones the task
 *    - FINAL STATE: System cannot change once set
 * 
 * 7. REMOVED (User-Only)
 *    - User marks task as removed/cancelled
 *    - FINAL STATE: System cannot change once set
 * 
 * FINAL STATES:
 * =============
 * Once a user sets a task to REMOVED, FINISHED, DEFERRED, or FAILED,
 * the system will NEVER change the state automatically.
 * These are considered "terminal" or "final" states.
 * 
 * SYSTEM-MANAGED STATES:
 * ======================
 * FILED, SCHEDULED, DOING - These can be changed by the system based on rules.
 * 
 * RULE EVALUATION ORDER:
 * ======================
 * 1. Check if state is final (REMOVED, FINISHED, DEFERRED, FAILED) -> Skip all rules
 * 2. Check if overdue by more than 1 day -> Set to FAILED
 * 3. Check if scheduled for today -> Set to DOING
 * 4. Check if has any schedule entries -> Set to SCHEDULED
 * 5. Default -> Remains FILED
 * 
 * ASSUMPTIONS:
 * ============
 * - "Today" is determined by the current date (ignoring time)
 * - A schedule entry is "today" if its start time falls on today's date
 * - Due date comparison uses the date portion only
 * - "1 day after due date" means due date + 1 full day (24 hours)
 * - The rules engine runs whenever:
 *   a) A task is loaded from storage
 *   b) A schedule entry is added/removed
 *   c) A task is retrieved for display
 */

import { Task, TaskState, ScheduleHistoryEntry } from '../types/Task';

export class TaskStateRulesEngine {
    /**
     * States that are final and cannot be changed by the system
     */
    private static readonly FINAL_STATES: TaskState[] = ['Removed', 'Finished', 'Deferred', 'Failed'];

    /**
     * States that can only be set by the user
     */
    private static readonly USER_ONLY_STATES: TaskState[] = ['Removed', 'Finished', 'Deferred', 'Failed'];

    /**
     * States that can be set by the system
     */
    private static readonly SYSTEM_MANAGED_STATES: TaskState[] = ['Filed', 'Scheduled', 'Doing'];

    /**
     * Check if a state is final (user-set and immutable by system)
     */
    static isFinalState(state: TaskState): boolean {
        return this.FINAL_STATES.includes(state);
    }

    /**
     * Check if a state can only be set by user
     */
    static isUserOnlyState(state: TaskState): boolean {
        return this.USER_ONLY_STATES.includes(state);
    }

    /**
     * Check if a state can be managed by the system
     */
    static isSystemManagedState(state: TaskState): boolean {
        return this.SYSTEM_MANAGED_STATES.includes(state);
    }

    /**
     * Check if task is overdue by more than 1 day
     */
    private static isOverdueByMoreThanOneDay(task: Task): boolean {
        if (!task.dueDateTime) {
            return false; // No due date means can't be overdue
        }

        const now = new Date();
        const dueDate = new Date(task.dueDateTime);
        const oneDayAfterDue = new Date(dueDate);
        oneDayAfterDue.setDate(oneDayAfterDue.getDate() + 1);

        return now > oneDayAfterDue;
    }

    /**
     * Check if task has a schedule entry for today
     */
    private static hasScheduleEntryToday(task: Task): boolean {
        if (!task.scheduleHistory || task.scheduleHistory.length === 0) {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

        return task.scheduleHistory.some(entry => {
            const entryStart = new Date(entry.startTime);
            // Check if start time falls within today
            return entryStart >= today && entryStart < tomorrow;
        });
    }

    /**
     * Check if task has any schedule entries
     */
    private static hasScheduleEntries(task: Task): boolean {
        return task.scheduleHistory && task.scheduleHistory.length > 0;
    }

    /**
     * Apply rules engine to determine the correct state for a task
     * This is the main entry point for state calculation
     */
    static calculateState(task: Task): TaskState {
        // Rule 1: If state is final, never change it
        if (this.isFinalState(task.state)) {
            return task.state;
        }

        // Rule 2: If overdue by more than 1 day, set to FAILED
        if (this.isOverdueByMoreThanOneDay(task)) {
            return 'Failed';
        }

        // Rule 3: If scheduled for today, set to DOING
        if (this.hasScheduleEntryToday(task)) {
            return 'Doing';
        }

        // Rule 4: If has any schedule entries, set to SCHEDULED
        if (this.hasScheduleEntries(task)) {
            return 'Scheduled';
        }

        // Rule 5: Default state is FILED
        return 'Filed';
    }

    /**
     * Validate if a user can set a specific state
     * Returns true if allowed, false otherwise
     */
    static canUserSetState(currentState: TaskState, newState: TaskState): boolean {
        // User can only set the user-only states
        if (!this.isUserOnlyState(newState)) {
            return false;
        }

        // Once a final state is set, user cannot change it
        // (This prevents users from "un-finishing" or "un-removing" tasks)
        // If you want to allow state changes between final states, modify this
        if (this.isFinalState(currentState)) {
            return false; // Once final, cannot change
        }

        return true;
    }

    /**
     * Apply rules to a task and update its state if necessary
     * Returns true if state was changed, false otherwise
     */
    static applyRules(task: Task): boolean {
        const currentState = task.state;
        const calculatedState = this.calculateState(task);

        if (currentState !== calculatedState) {
            task.state = calculatedState;
            return true;
        }

        return false;
    }

    /**
     * Get a human-readable explanation of why a task is in a particular state
     */
    static getStateReason(task: Task): string {
        if (this.isFinalState(task.state)) {
            return `Task is in a final state set by user: ${task.state}`;
        }

        if (this.isOverdueByMoreThanOneDay(task)) {
            return 'Task automatically failed: Due date + 1 day has passed';
        }

        if (this.hasScheduleEntryToday(task)) {
            return 'Task is in progress: Scheduled for today';
        }

        if (this.hasScheduleEntries(task)) {
            return 'Task is scheduled: Has schedule entries';
        }

        return 'Task is filed: No schedule entries yet';
    }

    /**
     * Get available state transitions for a task from user perspective
     */
    static getAvailableUserStates(task: Task): TaskState[] {
        // If already in a final state, no transitions available
        if (this.isFinalState(task.state)) {
            return [];
        }

        // User can always transition to any user-only state
        return [...this.USER_ONLY_STATES];
    }
}
