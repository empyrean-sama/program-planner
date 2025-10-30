import { Task, TaskState } from '../types/Task';
import dayjs from 'dayjs';

/**
 * Task Card Appearance Rules Engine
 * 
 * This engine determines the visual appearance of task cards based on:
 * - Task state
 * - Progress vs estimated time
 * - Due date status
 * - Schedule history
 * - Other contextual factors
 */

export interface TaskCardStyles {
    backgroundColor: string;
    backgroundImage?: string;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: string;
    opacity?: number;
    textDecoration?: string;
    shadow?: string;
}

export interface TaskCardWarnings {
    overdue: boolean;
    overdueMessage?: string;
    scheduleExceedsEstimate: boolean;
    scheduleExceedsEstimateMessage?: string;
    noProgressWarning: boolean;
    noProgressMessage?: string;
    stalledWarning: boolean;
    stalledMessage?: string;
    scheduleBeyondDueDate: boolean;
    scheduleBeyondDueDateMessage?: string;
}

export interface TaskCardMetrics {
    progressPercentage: number; // 0-100, percentage of elapsed vs estimated
    isOverdue: boolean;
    daysUntilDue?: number;
    hasSchedule: boolean;
    hasEstimate: boolean;
    isStalled: boolean; // Has schedules but none recent
    exceedsEstimate: boolean; // Elapsed > Estimated
}

export interface TaskCardAppearance {
    styles: TaskCardStyles;
    warnings: TaskCardWarnings;
    metrics: TaskCardMetrics;
    showWarningIcon: boolean;
    warningIconColor: 'error' | 'warning' | 'info';
    chipColor: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

/**
 * Calculate task metrics
 */
function calculateMetrics(task: Task): TaskCardMetrics {
    const hasEstimate = task.estimatedTime !== undefined && task.estimatedTime > 0;
    const hasSchedule = task.scheduleHistory.length > 0;
    
    // Calculate progress percentage
    let progressPercentage = 0;
    if (hasEstimate && task.elapsedTime > 0) {
        progressPercentage = Math.min(100, (task.elapsedTime / task.estimatedTime!) * 100);
    }
    
    // Check if overdue
    const isOverdue = task.dueDateTime 
        ? dayjs().isAfter(dayjs(task.dueDateTime))
        : false;
    
    // Calculate days until due
    let daysUntilDue: number | undefined;
    if (task.dueDateTime) {
        daysUntilDue = dayjs(task.dueDateTime).diff(dayjs(), 'day');
    }
    
    // Check if stalled (has schedules but latest is > 7 days old)
    let isStalled = false;
    if (hasSchedule) {
        const latestSchedule = task.scheduleHistory[task.scheduleHistory.length - 1];
        const daysSinceLastSchedule = dayjs().diff(dayjs(latestSchedule.endTime), 'day');
        isStalled = daysSinceLastSchedule > 7 && !['Finished', 'Failed', 'Removed', 'Deferred'].includes(task.state);
    }
    
    // Check if exceeds estimate
    const exceedsEstimate = hasEstimate && task.elapsedTime > task.estimatedTime!;
    
    return {
        progressPercentage,
        isOverdue,
        daysUntilDue,
        hasSchedule,
        hasEstimate,
        isStalled,
        exceedsEstimate,
    };
}

/**
 * Calculate warnings based on task state and metrics
 */
function calculateWarnings(task: Task, metrics: TaskCardMetrics): TaskCardWarnings {
    const warnings: TaskCardWarnings = {
        overdue: false,
        scheduleExceedsEstimate: false,
        noProgressWarning: false,
        stalledWarning: false,
        scheduleBeyondDueDate: false,
    };
    
    // Overdue warning
    if (metrics.isOverdue && !['Finished', 'Removed', 'Failed'].includes(task.state)) {
        warnings.overdue = true;
        const daysOverdue = Math.abs(metrics.daysUntilDue || 0);
        warnings.overdueMessage = `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
    }
    
    // Schedule exceeds estimate warning
    if (metrics.exceedsEstimate && task.state !== 'Finished') {
        warnings.scheduleExceedsEstimate = true;
        const excess = task.elapsedTime - (task.estimatedTime || 0);
        warnings.scheduleExceedsEstimateMessage = `Exceeded estimate by ${excess} minutes`;
    }
    
    // Check if any schedule entries are beyond the due date
    if (task.dueDateTime && task.scheduleHistory.length > 0 && !['Finished', 'Removed', 'Failed'].includes(task.state)) {
        const dueDate = dayjs(task.dueDateTime);
        const schedulesAfterDue = task.scheduleHistory.filter(schedule => {
            const scheduleStart = dayjs(schedule.startTime);
            const scheduleEnd = dayjs(schedule.endTime);
            // Check if schedule starts or ends after due date
            return scheduleStart.isAfter(dueDate) || scheduleEnd.isAfter(dueDate);
        });
        
        if (schedulesAfterDue.length > 0) {
            warnings.scheduleBeyondDueDate = true;
            warnings.scheduleBeyondDueDateMessage = `${schedulesAfterDue.length} schedule${schedulesAfterDue.length !== 1 ? 's' : ''} beyond due date`;
        }
    }
    
    // No progress warning (has deadline but no schedule)
    if (task.dueDateTime && !metrics.hasSchedule && task.state === 'Filed') {
        const daysUntilDue = metrics.daysUntilDue || 0;
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            warnings.noProgressWarning = true;
            warnings.noProgressMessage = `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} with no progress`;
        }
    }
    
    // Stalled warning
    if (metrics.isStalled) {
        warnings.stalledWarning = true;
        const latestSchedule = task.scheduleHistory[task.scheduleHistory.length - 1];
        const daysSinceLastSchedule = dayjs().diff(dayjs(latestSchedule.endTime), 'day');
        warnings.stalledMessage = `No activity for ${daysSinceLastSchedule} days`;
    }
    
    return warnings;
}

/**
 * Generate gradient for scheduled tasks based on progress
 */
function generateProgressGradient(progressPercentage: number, exceedsEstimate: boolean): string {
    if (exceedsEstimate) {
        // Red gradient for exceeded estimate
        const intensity = Math.min(progressPercentage - 100, 50);
        return `linear-gradient(135deg, 
            rgba(237, 66, 69, 0.1) 0%, 
            rgba(237, 66, 69, ${0.2 + intensity / 250}) 100%)`;
    }
    
    // Green to amber gradient based on progress
    if (progressPercentage < 50) {
        // Green gradient for early progress
        return `linear-gradient(135deg, 
            rgba(67, 181, 129, 0.1) 0%, 
            rgba(67, 181, 129, ${0.15 + progressPercentage / 333}) 100%)`;
    } else if (progressPercentage < 80) {
        // Amber gradient for mid progress
        return `linear-gradient(135deg, 
            rgba(250, 166, 26, 0.1) 0%, 
            rgba(250, 166, 26, ${0.15 + progressPercentage / 400}) 100%)`;
    } else {
        // Orange gradient for high progress
        return `linear-gradient(135deg, 
            rgba(250, 166, 26, 0.1) 0%, 
            rgba(250, 166, 26, ${0.2 + progressPercentage / 333}) 100%)`;
    }
}

/**
 * Calculate task card styles based on state and metrics
 */
function calculateStyles(task: Task, metrics: TaskCardMetrics, warnings: TaskCardWarnings): TaskCardStyles {
    const styles: TaskCardStyles = {
        backgroundColor: 'background.paper',
    };
    
    switch (task.state) {
        case 'Filed':
            // Grey background (default)
            styles.backgroundColor = 'rgba(0, 0, 0, 0.04)';
            
            // Add warning border if approaching deadline with no progress
            if (warnings.noProgressWarning) {
                styles.borderColor = 'warning.main';
                styles.borderWidth = 2;
                styles.borderStyle = 'solid';
            }
            break;
            
        case 'Scheduled':
            // Gradient based on progress
            if (metrics.hasEstimate && metrics.hasSchedule) {
                styles.backgroundImage = generateProgressGradient(
                    metrics.progressPercentage, 
                    metrics.exceedsEstimate
                );
                styles.backgroundColor = 'transparent';
            } else {
                // Light blurple gradient if no estimate (using primary color)
                styles.backgroundImage = 'linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(88, 101, 242, 0.2) 100%)';
                styles.backgroundColor = 'transparent';
            }
            
            // Add border for overdue, schedule beyond due date, or exceeded estimate
            if (warnings.overdue || warnings.scheduleBeyondDueDate) {
                styles.borderColor = 'error.main';
                styles.borderWidth = 2;
                styles.borderStyle = 'solid';
            } else if (metrics.exceedsEstimate) {
                styles.borderColor = 'warning.main';
                styles.borderWidth = 2;
                styles.borderStyle = 'dashed';
            }
            break;
            
        case 'Doing':
            // Vibrant blurple gradient with pulse effect (primary color)
            styles.backgroundImage = 'linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(88, 101, 242, 0.3) 100%)';
            styles.backgroundColor = 'transparent';
            styles.borderColor = 'primary.main';
            styles.borderWidth = 2;
            styles.borderStyle = 'solid';
            
            // Warning if overdue or schedule beyond due date
            if (warnings.overdue || warnings.scheduleBeyondDueDate) {
                styles.borderColor = 'error.main';
            }
            break;
            
        case 'Finished':
            // Success green background (darker for better contrast)
            styles.backgroundImage = 'linear-gradient(135deg, rgba(67, 181, 129, 0.15) 0%, rgba(67, 181, 129, 0.25) 100%)';
            styles.backgroundColor = 'transparent';
            styles.borderColor = 'success.main';
            styles.borderWidth = 1;
            styles.borderStyle = 'solid';
            break;
            
        case 'Failed':
            // Red background (adjusted for consistency)
            styles.backgroundImage = 'linear-gradient(135deg, rgba(237, 66, 69, 0.15) 0%, rgba(237, 66, 69, 0.25) 100%)';
            styles.backgroundColor = 'transparent';
            styles.borderColor = 'error.main';
            styles.borderWidth = 1;
            styles.borderStyle = 'solid';
            break;
            
        case 'Deferred':
            // Amber/orange background (better contrast)
            styles.backgroundImage = 'linear-gradient(135deg, rgba(250, 166, 26, 0.1) 0%, rgba(250, 166, 26, 0.2) 100%)';
            styles.backgroundColor = 'transparent';
            styles.opacity = 0.85;
            break;
            
        case 'Removed':
            // Grey with low opacity and strikethrough
            styles.backgroundColor = 'rgba(0, 0, 0, 0.02)';
            styles.opacity = 0.6;
            styles.textDecoration = 'line-through';
            break;
    }
    
    // Add stalled indicator
    if (warnings.stalledWarning && task.state !== 'Removed') {
        styles.borderStyle = 'dashed';
        if (!styles.borderColor) {
            styles.borderColor = 'warning.main';
            styles.borderWidth = 1;
        }
    }
    
    return styles;
}

/**
 * Main function to calculate task card appearance
 */
export function getTaskCardAppearance(task: Task): TaskCardAppearance {
    const metrics = calculateMetrics(task);
    const warnings = calculateWarnings(task, metrics);
    const styles = calculateStyles(task, metrics, warnings);
    
    // Determine if warning icon should be shown
    const showWarningIcon = 
        warnings.overdue || 
        warnings.scheduleExceedsEstimate || 
        warnings.noProgressWarning ||
        warnings.stalledWarning ||
        warnings.scheduleBeyondDueDate;
    
    // Determine warning icon color
    let warningIconColor: 'error' | 'warning' | 'info' = 'warning';
    if (warnings.overdue || warnings.scheduleBeyondDueDate) {
        warningIconColor = 'error';
    } else if (warnings.scheduleExceedsEstimate) {
        warningIconColor = 'warning';
    } else {
        warningIconColor = 'info';
    }
    
    // Determine chip color based on state
    const chipColor = getChipColor(task.state);
    
    return {
        styles,
        warnings,
        metrics,
        showWarningIcon,
        warningIconColor,
        chipColor,
    };
}

/**
 * Get chip color based on task state
 */
function getChipColor(state: TaskState): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' {
    switch (state) {
        case 'Filed': return 'default';
        case 'Scheduled': return 'info';
        case 'Doing': return 'primary';
        case 'Finished': return 'success';
        case 'Failed': return 'error';
        case 'Deferred': return 'warning';
        case 'Removed': return 'default';
        default: return 'default';
    }
}

/**
 * Get all warnings as an array of messages
 */
export function getWarningMessages(warnings: TaskCardWarnings): string[] {
    const messages: string[] = [];
    
    if (warnings.overdue && warnings.overdueMessage) {
        messages.push(warnings.overdueMessage);
    }
    
    if (warnings.scheduleBeyondDueDate && warnings.scheduleBeyondDueDateMessage) {
        messages.push(warnings.scheduleBeyondDueDateMessage);
    }
    
    if (warnings.scheduleExceedsEstimate && warnings.scheduleExceedsEstimateMessage) {
        messages.push(warnings.scheduleExceedsEstimateMessage);
    }
    
    if (warnings.noProgressWarning && warnings.noProgressMessage) {
        messages.push(warnings.noProgressMessage);
    }
    
    if (warnings.stalledWarning && warnings.stalledMessage) {
        messages.push(warnings.stalledMessage);
    }
    
    return messages;
}
