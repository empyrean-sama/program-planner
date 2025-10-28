import { Task, ScheduleHistoryEntry } from '../../../../types/Task';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export interface TaskCalendarEvent {
    task: Task;
    scheduleEntry: ScheduleHistoryEntry;
    startTime: Dayjs;
    endTime: Dayjs;
    top: number;
    height: number;
}

export interface TaskDeadline {
    task: Task;
    dueDateTime: Dayjs;
}

/**
 * Get all tasks that have deadlines on a specific date
 */
export function getTaskDeadlinesForDate(tasks: Task[], date: Dayjs): TaskDeadline[] {
    return tasks
        .filter(task => {
            if (!task.dueDateTime || task.state === 'Removed') return false;
            const dueDate = dayjs(task.dueDateTime);
            return dueDate.isSame(date, 'day');
        })
        .map(task => ({
            task,
            dueDateTime: dayjs(task.dueDateTime!),
        }));
}

/**
 * Get all task schedule entries for a specific date
 */
export function getTaskSchedulesForDate(tasks: Task[], date: Dayjs): TaskCalendarEvent[] {
    const events: TaskCalendarEvent[] = [];

    tasks.forEach(task => {
        // Skip removed tasks
        if (task.state === 'Removed') return;

        task.scheduleHistory.forEach((entry: ScheduleHistoryEntry) => {
            const entryStart = dayjs(entry.startTime);
            const entryEnd = dayjs(entry.endTime);

            // Check if the entry falls on the given date
            if (entryStart.isSame(date, 'day') || entryEnd.isSame(date, 'day') || 
                (entryStart.isBefore(date, 'day') && entryEnd.isAfter(date, 'day'))) {
                events.push({
                    task,
                    scheduleEntry: entry,
                    startTime: entryStart,
                    endTime: entryEnd,
                    top: 0, // Will be calculated based on hour
                    height: 0, // Will be calculated based on duration
                });
            }
        });
    });

    return events;
}

/**
 * Calculate position and height for a task event in a calendar view
 */
export function calculateEventPosition(
    event: TaskCalendarEvent,
    date: Dayjs,
    hourHeight: number
): { top: number; height: number; startsBeforeDay: boolean; endsAfterDay: boolean } {
    const dayStart = date.startOf('day');
    const dayEnd = date.endOf('day');

    // Determine effective start and end times for this day
    const effectiveStart = event.startTime.isBefore(dayStart) ? dayStart : event.startTime;
    const effectiveEnd = event.endTime.isAfter(dayEnd) ? dayEnd : event.endTime;

    // Calculate hours from start of day
    const startHour = effectiveStart.diff(dayStart, 'minute') / 60;
    const duration = effectiveEnd.diff(effectiveStart, 'minute') / 60;

    return {
        top: startHour * hourHeight,
        height: Math.max(duration * hourHeight, 20), // Minimum height of 20px
        startsBeforeDay: event.startTime.isBefore(dayStart),
        endsAfterDay: event.endTime.isAfter(dayEnd),
    };
}

/**
 * Get the color for a task based on its state
 */
export function getTaskColor(state: string): string {
    switch (state) {
        case 'Filed': return '#9e9e9e'; // gray
        case 'Scheduled': return '#2196f3'; // blue
        case 'Doing': return '#ff9800'; // orange
        case 'Finished': return '#4caf50'; // green
        case 'Failed': return '#f44336'; // red
        case 'Deferred': return '#9c27b0'; // purple
        case 'Removed': return '#757575'; // dark gray
        default: return '#9e9e9e';
    }
}

/**
 * Format task time range for display
 */
export function formatTaskTimeRange(start: Dayjs, end: Dayjs): string {
    return `${start.format('h:mm A')} - ${end.format('h:mm A')}`;
}

/**
 * Get deadline indicator color based on how close it is
 */
export function getDeadlineUrgency(dueDateTime: Dayjs): 'high' | 'medium' | 'low' {
    const now = dayjs();
    const hoursUntilDue = dueDateTime.diff(now, 'hour');

    if (hoursUntilDue < 0) return 'high'; // Overdue
    if (hoursUntilDue < 24) return 'high'; // Less than 1 day
    if (hoursUntilDue < 72) return 'medium'; // Less than 3 days
    return 'low';
}

/**
 * Get color for deadline urgency
 */
export function getDeadlineColor(urgency: 'high' | 'medium' | 'low'): string {
    switch (urgency) {
        case 'high': return '#f44336'; // red
        case 'medium': return '#ff9800'; // orange
        case 'low': return '#2196f3'; // blue
    }
}
