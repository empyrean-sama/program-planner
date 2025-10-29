import { Task, TaskState } from '../types/Task';
import dayjs, { Dayjs } from 'dayjs';

export interface TaskMetrics {
    // Overall Stats
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    activeTasks: number;
    completionRate: number;
    failureRate: number;
    
    // State Distribution
    stateDistribution: Record<TaskState, number>;
    statePercentages: Record<TaskState, number>;
    
    // Deadline Stats
    onTimeCompletions: number;
    lateCompletions: number;
    deadlineAdherenceRate: number;
    upcomingDeadlines: number;
    overdueActive: number;
    
    // Velocity Stats
    tasksCompletedToday: number;
    tasksCompletedThisWeek: number;
    tasksCompletedThisMonth: number;
    averageTasksPerDay: number;
    averageTasksPerWeek: number;
    
    // Point Stats
    totalPointsEarned: number;
    totalPointsPossible: number;
    averagePointsPerTask: number;
    pointEfficiencyRate: number;
    
    // Workload Stats
    averageTimeToComplete: number; // in days
    totalActivePoints: number;
    estimatedDaysToComplete: number;
}

export interface VelocityDataPoint {
    date: string;
    completed: number;
    failed: number;
    cumulative: number;
}

export interface DeadlineStats {
    category: string;
    count: number;
    percentage: number;
}

export interface ProductivityInsight {
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    actionable?: string;
}

/**
 * Calculate comprehensive metrics from tasks
 */
export function calculateMetrics(tasks: Task[]): TaskMetrics {
    const now = dayjs();
    
    // Basic counts
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.state === 'Finished').length;
    const failedTasks = tasks.filter(t => t.state === 'Failed').length;
    const activeTasks = tasks.filter(t => 
        t.state === 'Scheduled' || t.state === 'Doing'
    ).length;
    
    // Completion rates
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const failureRate = totalTasks > 0 ? (failedTasks / totalTasks) * 100 : 0;
    
    // State distribution
    const stateDistribution: Record<TaskState, number> = {
        Filed: 0,
        Scheduled: 0,
        Doing: 0,
        Finished: 0,
        Failed: 0,
        Deferred: 0,
        Removed: 0,
    };
    
    tasks.forEach(task => {
        stateDistribution[task.state]++;
    });
    
    const statePercentages: Record<TaskState, number> = {} as Record<TaskState, number>;
    (Object.keys(stateDistribution) as TaskState[]).forEach(state => {
        statePercentages[state] = totalTasks > 0 
            ? (stateDistribution[state] / totalTasks) * 100 
            : 0;
    });
    
    // Deadline analysis
    const completedWithDeadline = tasks.filter(t => 
        (t.state === 'Finished' || t.state === 'Failed') && t.dueDateTime
    );
    
    let onTimeCompletions = 0;
    let lateCompletions = 0;
    
    completedWithDeadline.forEach(task => {
        if (!task.dueDateTime) return;
        
        // Get last schedule entry as proxy for completion date
        const lastSchedule = task.scheduleHistory[task.scheduleHistory.length - 1];
        if (!lastSchedule) return;
        
        const dueDate = dayjs(task.dueDateTime);
        const completionDate = dayjs(lastSchedule.endTime);
        
        if (completionDate.isAfter(dueDate)) {
            lateCompletions++;
        } else {
            onTimeCompletions++;
        }
    });
    
    const deadlineAdherenceRate = completedWithDeadline.length > 0
        ? (onTimeCompletions / completedWithDeadline.length) * 100
        : 0;
    
    const upcomingDeadlines = tasks.filter(t => 
        (t.state === 'Scheduled' || t.state === 'Doing') && 
        t.dueDateTime &&
        dayjs(t.dueDateTime).isAfter(now) &&
        dayjs(t.dueDateTime).diff(now, 'day') <= 7
    ).length;
    
    const overdueActive = tasks.filter(t => 
        (t.state === 'Scheduled' || t.state === 'Doing') && 
        t.dueDateTime &&
        dayjs(t.dueDateTime).isBefore(now)
    ).length;
    
    // Velocity calculations (using last schedule entry as completion date)
    const tasksCompletedToday = tasks.filter(t => {
        if (t.state !== 'Finished') return false;
        const lastSchedule = t.scheduleHistory[t.scheduleHistory.length - 1];
        return lastSchedule && dayjs(lastSchedule.endTime).isSame(now, 'day');
    }).length;
    
    const tasksCompletedThisWeek = tasks.filter(t => {
        if (t.state !== 'Finished') return false;
        const lastSchedule = t.scheduleHistory[t.scheduleHistory.length - 1];
        return lastSchedule && dayjs(lastSchedule.endTime).isSame(now, 'week');
    }).length;
    
    const tasksCompletedThisMonth = tasks.filter(t => {
        if (t.state !== 'Finished') return false;
        const lastSchedule = t.scheduleHistory[t.scheduleHistory.length - 1];
        return lastSchedule && dayjs(lastSchedule.endTime).isSame(now, 'month');
    }).length;
    
    // Calculate average velocity (last 30 days)
    const thirtyDaysAgo = now.subtract(30, 'day');
    const recentCompletions = tasks.filter(t => {
        if (t.state !== 'Finished') return false;
        const lastSchedule = t.scheduleHistory[t.scheduleHistory.length - 1];
        return lastSchedule && dayjs(lastSchedule.endTime).isAfter(thirtyDaysAgo);
    }).length;
    
    const averageTasksPerDay = recentCompletions / 30;
    const averageTasksPerWeek = averageTasksPerDay * 7;
    
    // Point statistics
    const completedWithPoints = tasks.filter(t => 
        t.state === 'Finished' && t.points !== undefined
    );
    const totalPointsEarned = completedWithPoints.reduce((sum, t) => sum + (t.points || 0), 0);
    
    const allTasksWithPoints = tasks.filter(t => t.points !== undefined);
    const totalPointsPossible = allTasksWithPoints.reduce((sum, t) => sum + (t.points || 0), 0);
    
    const averagePointsPerTask = completedWithPoints.length > 0
        ? totalPointsEarned / completedWithPoints.length
        : 0;
    
    const pointEfficiencyRate = totalPointsPossible > 0
        ? (totalPointsEarned / totalPointsPossible) * 100
        : 0;
    
    // Workload analysis
    const tasksWithTimeTracking = tasks.filter(t => 
        t.state === 'Finished' && 
        t.scheduleHistory.length > 0
    );
    
    let totalCompletionTime = 0;
    tasksWithTimeTracking.forEach(task => {
        const firstSchedule = task.scheduleHistory[0];
        const lastSchedule = task.scheduleHistory[task.scheduleHistory.length - 1];
        if (!firstSchedule || !lastSchedule) return;
        const days = dayjs(lastSchedule.endTime).diff(dayjs(firstSchedule.startTime), 'day', true);
        totalCompletionTime += days;
    });
    
    const averageTimeToComplete = tasksWithTimeTracking.length > 0
        ? totalCompletionTime / tasksWithTimeTracking.length
        : 0;
    
    const activeTasksWithPoints = tasks.filter(t => 
        (t.state === 'Scheduled' || t.state === 'Doing') && 
        t.points !== undefined
    );
    const totalActivePoints = activeTasksWithPoints.reduce((sum, t) => sum + (t.points || 0), 0);
    
    const estimatedDaysToComplete = averageTasksPerDay > 0
        ? activeTasks / averageTasksPerDay
        : 0;
    
    return {
        totalTasks,
        completedTasks,
        failedTasks,
        activeTasks,
        completionRate,
        failureRate,
        stateDistribution,
        statePercentages,
        onTimeCompletions,
        lateCompletions,
        deadlineAdherenceRate,
        upcomingDeadlines,
        overdueActive,
        tasksCompletedToday,
        tasksCompletedThisWeek,
        tasksCompletedThisMonth,
        averageTasksPerDay,
        averageTasksPerWeek,
        totalPointsEarned,
        totalPointsPossible,
        averagePointsPerTask,
        pointEfficiencyRate,
        averageTimeToComplete,
        totalActivePoints,
        estimatedDaysToComplete,
    };
}

/**
 * Generate velocity data points for charting
 */
export function generateVelocityData(
    tasks: Task[], 
    period: 'week' | 'month' | 'quarter' = 'month'
): VelocityDataPoint[] {
    const now = dayjs();
    let startDate: Dayjs;
    let days: number;
    
    switch (period) {
        case 'week':
            startDate = now.subtract(7, 'day');
            days = 7;
            break;
        case 'quarter':
            startDate = now.subtract(90, 'day');
            days = 90;
            break;
        case 'month':
        default:
            startDate = now.subtract(30, 'day');
            days = 30;
            break;
    }
    
    const dataPoints: VelocityDataPoint[] = [];
    let cumulative = 0;
    
    for (let i = 0; i < days; i++) {
        const date = startDate.add(i, 'day');
        const dateStr = date.format('MMM DD');
        
        const completed = tasks.filter(t => {
            if (t.state !== 'Finished') return false;
            const lastSchedule = t.scheduleHistory[t.scheduleHistory.length - 1];
            return lastSchedule && dayjs(lastSchedule.endTime).isSame(date, 'day');
        }).length;
        
        const failed = tasks.filter(t => {
            if (t.state !== 'Failed') return false;
            const lastSchedule = t.scheduleHistory[t.scheduleHistory.length - 1];
            return lastSchedule && dayjs(lastSchedule.endTime).isSame(date, 'day');
        }).length;
        
        cumulative += completed;
        
        dataPoints.push({
            date: dateStr,
            completed,
            failed,
            cumulative,
        });
    }
    
    return dataPoints;
}

/**
 * Generate deadline adherence statistics
 */
export function generateDeadlineStats(tasks: Task[]): DeadlineStats[] {
    const completedWithDeadline = tasks.filter(t => 
        (t.state === 'Finished' || t.state === 'Failed') && 
        t.dueDateTime && 
        t.scheduleHistory.length > 0
    );
    
    let earlyCount = 0;
    let onTimeCount = 0;
    let lateCount = 0;
    
    completedWithDeadline.forEach(task => {
        if (!task.dueDateTime) return;
        const lastSchedule = task.scheduleHistory[task.scheduleHistory.length - 1];
        if (!lastSchedule) return;
        
        const dueDate = dayjs(task.dueDateTime);
        const completionDate = dayjs(lastSchedule.endTime);
        const daysDiff = completionDate.diff(dueDate, 'day');
        
        if (daysDiff < -2) {
            earlyCount++;
        } else if (daysDiff <= 0) {
            onTimeCount++;
        } else {
            lateCount++;
        }
    });
    
    const total = completedWithDeadline.length || 1;
    
    return [
        { category: 'Early', count: earlyCount, percentage: (earlyCount / total) * 100 },
        { category: 'On Time', count: onTimeCount, percentage: (onTimeCount / total) * 100 },
        { category: 'Late', count: lateCount, percentage: (lateCount / total) * 100 },
    ];
}

/**
 * Generate productivity insights based on metrics
 */
export function generateInsights(tasks: Task[], metrics: TaskMetrics): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    
    // Completion rate insights
    if (metrics.completionRate >= 80) {
        insights.push({
            type: 'success',
            title: 'Excellent Completion Rate!',
            message: `You're completing ${metrics.completionRate.toFixed(1)}% of your tasks. Keep up the great work!`,
            actionable: 'Consider taking on more challenging tasks to grow further.',
        });
    } else if (metrics.completionRate < 50) {
        insights.push({
            type: 'warning',
            title: 'Low Completion Rate',
            message: `Only ${metrics.completionRate.toFixed(1)}% of tasks are completed.`,
            actionable: 'Break down larger tasks into smaller, manageable chunks. Focus on completing 2-3 tasks daily.',
        });
    }
    
    // Deadline adherence insights
    if (metrics.deadlineAdherenceRate >= 90) {
        insights.push({
            type: 'success',
            title: 'Outstanding Deadline Management',
            message: `${metrics.deadlineAdherenceRate.toFixed(1)}% on-time completion rate!`,
        });
    } else if (metrics.deadlineAdherenceRate < 60 && metrics.onTimeCompletions + metrics.lateCompletions > 5) {
        insights.push({
            type: 'error',
            title: 'Deadline Challenges Detected',
            message: `Only ${metrics.deadlineAdherenceRate.toFixed(1)}% of tasks completed on time.`,
            actionable: 'Set more realistic deadlines or build in buffer time. Review time estimates regularly.',
        });
    }
    
    // Overdue tasks warning
    if (metrics.overdueActive > 0) {
        insights.push({
            type: 'error',
            title: 'Overdue Tasks Need Attention',
            message: `You have ${metrics.overdueActive} overdue task(s).`,
            actionable: 'Prioritize these immediately or reschedule if circumstances changed.',
        });
    }
    
    // Velocity insights
    if (metrics.averageTasksPerDay > 5) {
        insights.push({
            type: 'success',
            title: 'High Productivity Velocity',
            message: `Completing ${metrics.averageTasksPerDay.toFixed(1)} tasks per day on average.`,
            actionable: 'Ensure you\'re not burning out. Quality over quantity!',
        });
    } else if (metrics.averageTasksPerDay < 1 && metrics.activeTasks > 10) {
        insights.push({
            type: 'warning',
            title: 'Velocity Below Target',
            message: `Averaging ${metrics.averageTasksPerDay.toFixed(1)} tasks per day with ${metrics.activeTasks} active tasks.`,
            actionable: 'Focus on completing smaller tasks first. Build momentum with quick wins.',
        });
    }
    
    // Workload insights
    if (metrics.estimatedDaysToComplete > 60) {
        insights.push({
            type: 'info',
            title: 'Heavy Workload Ahead',
            message: `At current velocity, ${metrics.estimatedDaysToComplete.toFixed(0)} days to clear active tasks.`,
            actionable: 'Consider deferring low-priority tasks or increasing daily task completion.',
        });
    }
    
    // Failed tasks insights
    if (metrics.failureRate > 20) {
        insights.push({
            type: 'error',
            title: 'High Failure Rate',
            message: `${metrics.failureRate.toFixed(1)}% of tasks marked as failed.`,
            actionable: 'Review failed tasks for patterns. Are tasks too ambitious? Need better planning?',
        });
    }
    
    // Point efficiency
    if (metrics.pointEfficiencyRate >= 80 && metrics.totalPointsPossible > 0) {
        insights.push({
            type: 'success',
            title: 'Great Point Efficiency',
            message: `Earned ${metrics.pointEfficiencyRate.toFixed(1)}% of possible points.`,
        });
    }
    
    // Upcoming deadlines
    if (metrics.upcomingDeadlines > 3) {
        insights.push({
            type: 'warning',
            title: 'Busy Week Ahead',
            message: `${metrics.upcomingDeadlines} deadlines in the next 7 days.`,
            actionable: 'Plan your time carefully. Consider which tasks can be delegated or deferred.',
        });
    }
    
    // No recent activity
    if (metrics.tasksCompletedThisWeek === 0 && metrics.activeTasks > 0) {
        insights.push({
            type: 'info',
            title: 'No Tasks Completed This Week',
            message: 'Time to get back on track!',
            actionable: 'Start with the easiest task to build momentum.',
        });
    }
    
    // Positive momentum
    if (metrics.tasksCompletedToday > 3) {
        insights.push({
            type: 'success',
            title: 'On Fire Today!',
            message: `${metrics.tasksCompletedToday} tasks completed today.`,
        });
    }
    
    return insights;
}
