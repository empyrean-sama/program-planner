# Task State Rules Engine Documentation

## Overview

The Task State Rules Engine is an automatic system that manages task states based on predefined business rules. It ensures that task states accurately reflect their current status while allowing users to manually override to final states when needed.

## State Types

### System-Managed States
These states are automatically set by the rules engine:
- **Filed**: Initial state when a task is created
- **Scheduled**: Task has at least one schedule entry
- **Doing**: Task has a schedule entry for today

### User-Only States (Final States)
These states can only be set by the user and are permanent:
- **Removed**: Task is cancelled/removed
- **Finished**: Task is completed
- **Deferred**: Task is postponed
- **Failed**: Task failed (can be set by user or system)

## State Transition Rules

### Rule Priority (Evaluated in Order)

1. **Final State Check**
   - If task is in a final state (Removed, Finished, Deferred, Failed), skip all other rules
   - Final states are immutable by the system

2. **Overdue Check**
   - If current date > due date + 1 day, set state to **Failed**
   - Only applies if task is not already in a final state
   - Example: Due date is Oct 28, 2025 → Task fails automatically on Oct 30, 2025

3. **Today's Schedule Check**
   - If task has any schedule entry starting today, set state to **Doing**
   - "Today" is determined by the calendar date (ignoring time)
   - Example: If a schedule entry starts at any time on Oct 28, 2025, and today is Oct 28, 2025 → State is Doing

4. **Has Schedule Check**
   - If task has any schedule entries, set state to **Scheduled**
   - Applies to past, present, or future entries

5. **Default State**
   - If none of the above apply, state remains **Filed**

## State Transition Diagram

```
┌──────┐
│Filed │ ◄─── Initial state when task is created
└──┬───┘
   │
   ├─► Add schedule entry ──────────► ┌───────────┐
   │                                  │ Scheduled │
   │                                  └─────┬─────┘
   │                                        │
   │   ◄──────────────────────────────────┘
   │
   ├─► Schedule entry for today ─────► ┌───────┐
   │                                    │ Doing │
   │                                    └───┬───┘
   │                                        │
   │   ◄──────────────────────────────────┘
   │
   ├─► Due date + 1 day passed ───────► ┌────────┐
   │                                     │ Failed │ ◄─┐
   │                                     └────────┘   │
   │                                                  │
   └─► User sets final state ─────────────────────►┐ │
                                                    │ │
            ┌─────────┐  ┌──────────┐  ┌──────────┐│ │
            │ Removed │  │ Finished │  │ Deferred ││ │
            └─────────┘  └──────────┘  └──────────┘│ │
                                                    │ │
                    All final states ───────────────┘ │
                    (Once set, never change) ─────────┘
```

## Assumptions and Design Decisions

### 1. Date/Time Handling
- **"Today"** is based on calendar date only, ignoring the time component
- A schedule entry is considered "today" if its start time falls on the current calendar date
- Due date comparison uses full date-time for precision

### 2. Overdue Calculation
- **Grace Period**: Tasks don't fail immediately when due date passes
- **Failure Point**: Due date + 24 hours (1 full day)
- **Example**: 
  - Due: Oct 28, 2025 at 5:00 PM
  - Fails: Oct 29, 2025 at 5:00 PM

### 3. Final State Immutability
- Once a user sets a final state, the system **never** changes it
- Even if new schedule entries are added, the state remains unchanged
- Users cannot change between final states (prevents "un-finishing" tasks)

### 4. Schedule Entry Priority
- If a task has both future and today's schedule entries, "Doing" takes precedence over "Scheduled"
- Past entries alone don't affect state (only used for elapsed time calculation)

### 5. Rules Engine Execution Points
The rules engine runs automatically at these points:
- **On Load**: When tasks are loaded from disk on app startup
- **On Retrieval**: When getting all tasks or a specific task
- **On Schedule Change**: After adding or removing schedule entries
- **On Update**: After updating a task (but respects user-set final states)

## User Interaction

### What Users Can Do

1. **Set Final States**
   - Change task to: Removed, Finished, Deferred, or Failed
   - This action is irreversible
   - System will respect this choice forever

2. **Edit Other Fields**
   - Title, description, due date can be changed anytime
   - These changes may trigger state recalculation if not in a final state

3. **Add/Remove Schedule Entries**
   - Schedule entries affect state calculation
   - Adding today's entry → State becomes "Doing"
   - Removing all entries → State reverts to "Filed"

### What Users Cannot Do

1. **Cannot set system-managed states directly**
   - Cannot manually set to: Filed, Scheduled, or Doing
   - These are calculated automatically

2. **Cannot change final states**
   - Once set to Finished, cannot go back to Doing
   - Once set to Removed, it stays Removed

## API Integration

### State Validation

When updating a task, the system validates state changes:

```typescript
// This will throw an error:
updateTask({ id: "...", state: "Scheduled" }) 
// Error: User can only set: Removed, Finished, Deferred, Failed

// This will work:
updateTask({ id: "...", state: "Finished" })
// State set to Finished permanently
```

### Available States Query

Get available states for a task:

```typescript
TaskStateRulesEngine.getAvailableUserStates(task)
// Returns: ['Removed', 'Finished', 'Deferred', 'Failed']
// Or: [] if already in final state
```

### State Reason

Get explanation for current state:

```typescript
TaskStateRulesEngine.getStateReason(task)
// Returns:
// - "Task is filed: No schedule entries yet"
// - "Task is scheduled: Has schedule entries"
// - "Task is in progress: Scheduled for today"
// - "Task automatically failed: Due date + 1 day has passed"
// - "Task is in a final state set by user: Finished"
```

## Examples

### Example 1: Normal Task Lifecycle

```
Day 1: Create task
  → State: Filed

Day 2: Add schedule entry for Day 5
  → State: Scheduled

Day 5: Current date matches schedule entry
  → State: Doing

Day 6: Schedule entry completed
  → State: Scheduled (still has entries)

Day 6: User marks as Finished
  → State: Finished (final)

Day 7 onwards: State remains Finished forever
```

### Example 2: Overdue Task

```
Oct 20: Create task, set due date to Oct 25
  → State: Filed

Oct 26: One day past due (grace period)
  → State: Filed (no auto-fail yet)

Oct 27: More than 1 day past due
  → State: Failed (automatic)

Future: State remains Failed (final)
```

### Example 3: Task with Today's Schedule

```
Oct 28 9:00 AM: Add schedule entry for Oct 28 2:00 PM - 4:00 PM
  → State: Doing (entry is today)

Oct 28 5:00 PM: Entry completed
  → State: Scheduled (has schedule history)

Oct 29: Remove all schedule entries
  → State: Filed (no entries)
```

## Error Handling

### Invalid State Transitions

The system prevents invalid state changes:

```typescript
// Task currently in "Doing" state
updateTask({ state: "Scheduled" })
// ❌ Error: Cannot set system-managed states

updateTask({ state: "Finished" })
// ✅ Success: Set to final state

// Task now in "Finished" state
updateTask({ state: "Deferred" })
// ❌ Error: Cannot change final states
```

## Performance Considerations

1. **Lazy Evaluation**: Rules are evaluated only when tasks are accessed
2. **Batch Processing**: All tasks are processed on app startup
3. **Save Optimization**: State changes are saved immediately to disk
4. **Minimal Overhead**: Rules engine runs in O(n) time where n = number of schedule entries

## Future Enhancements

Potential improvements to consider:

1. **Recurring Tasks**: Handle tasks that repeat
2. **State History**: Track when and why states changed
3. **Custom Rules**: Allow users to define their own rules
4. **Notifications**: Alert users when tasks auto-transition
5. **State Analytics**: Reports on state distribution and transitions
6. **Bulk Operations**: Apply state changes to multiple tasks
7. **State Locking**: Prevent accidental state changes for important tasks
