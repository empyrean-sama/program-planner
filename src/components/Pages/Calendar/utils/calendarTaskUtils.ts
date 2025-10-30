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
    column?: number;
    totalColumns?: number;
}

export interface TaskDeadline {
    task: Task;
    dueDateTime: Dayjs;
}

/**
 * Get all tasks that have deadlines on a specific date
 * Excludes tasks in final states (Removed, Finished, Deferred, Failed)
 */
export function getTaskDeadlinesForDate(tasks: Task[], date: Dayjs): TaskDeadline[] {
    const finalStates = ['Removed', 'Finished', 'Deferred', 'Failed'];
    
    return tasks
        .filter(task => {
            if (!task.dueDateTime) return false;
            if (finalStates.includes(task.state)) return false;
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
 * Shows schedule entries for all tasks (including final states)
 */
export function getTaskSchedulesForDate(tasks: Task[], date: Dayjs): TaskCalendarEvent[] {
    const events: TaskCalendarEvent[] = [];

    tasks.forEach(task => {
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
 * Colors chosen for optimal contrast in dark mode
 */
export function getTaskColor(state: string): string {
    switch (state) {
        case 'Filed': return '#9e9e9e'; // gray
        case 'Scheduled': return '#5865F2'; // blurple (primary) - better contrast
        case 'Doing': return '#FAA61A'; // orange/amber - better contrast than bright yellow
        case 'Finished': return '#43B581'; // darker green - better contrast with white text
        case 'Failed': return '#ED4245'; // red
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

/**
 * Check if two events overlap in time
 */
function eventsOverlap(event1: TaskCalendarEvent, event2: TaskCalendarEvent): boolean {
    return event1.startTime.isBefore(event2.endTime) && event1.endTime.isAfter(event2.startTime);
}

/**
 * Calculate column layout for overlapping events
 * Returns events with column and totalColumns properties set
 */
export function layoutEvents(events: TaskCalendarEvent[]): TaskCalendarEvent[] {
    if (events.length === 0) return [];

    // Sort events by start time, then by duration (longer events first)
    const sortedEvents = [...events].sort((a, b) => {
        const startDiff = a.startTime.diff(b.startTime);
        if (startDiff !== 0) return startDiff;
        return b.endTime.diff(b.startTime) - a.endTime.diff(a.startTime);
    });

    // Track which column each event is in
    const eventColumns: number[] = new Array(sortedEvents.length).fill(-1);
    const columns: TaskCalendarEvent[][] = [];

    sortedEvents.forEach((event, index) => {
        // Find the first column where this event doesn't overlap with any existing event
        let column = 0;
        while (column < columns.length) {
            const overlaps = columns[column].some(existingEvent => 
                eventsOverlap(event, existingEvent)
            );
            if (!overlaps) break;
            column++;
        }

        // Assign event to column
        eventColumns[index] = column;
        if (!columns[column]) {
            columns[column] = [];
        }
        columns[column].push(event);
    });

    // For each event, calculate how many columns are needed for its overlapping group
    const eventTotalColumns: number[] = new Array(sortedEvents.length).fill(1);
    
    sortedEvents.forEach((event, index) => {
        // Find all events that overlap with this event
        const overlappingIndices = new Set<number>();
        overlappingIndices.add(index);
        
        // Add direct overlaps
        sortedEvents.forEach((otherEvent, otherIndex) => {
            if (index !== otherIndex && eventsOverlap(event, otherEvent)) {
                overlappingIndices.add(otherIndex);
            }
        });
        
        // Expand to include transitive overlaps (events that overlap with overlapping events)
        let changed = true;
        while (changed) {
            changed = false;
            const currentIndices = Array.from(overlappingIndices);
            currentIndices.forEach(idx => {
                sortedEvents.forEach((otherEvent, otherIndex) => {
                    if (!overlappingIndices.has(otherIndex) && eventsOverlap(sortedEvents[idx], otherEvent)) {
                        overlappingIndices.add(otherIndex);
                        changed = true;
                    }
                });
            });
        }
        
        // The total columns for this event is the maximum column number in its overlap group + 1
        let maxCol = 0;
        overlappingIndices.forEach(idx => {
            maxCol = Math.max(maxCol, eventColumns[idx]);
        });
        eventTotalColumns[index] = maxCol + 1;
    });

    // Update events with column information
    return sortedEvents.map((event, index) => ({
        ...event,
        column: eventColumns[index],
        totalColumns: eventTotalColumns[index],
    }));
}

