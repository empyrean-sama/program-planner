import { Box, Typography, Stack, Paper } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { 
    calculateMetrics, 
    generateVelocityData, 
    generateDeadlineStats,
    generateInsights 
} from '../../../utils/metricsCalculation';
import { StatCard } from './StatCard';
import { VelocityChart } from './VelocityChart';
import { StateDistributionChart } from './StateDistributionChart';
import { DeadlineAdherenceChart } from './DeadlineAdherenceChart';
import { InsightsPanel } from './InsightsPanel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Task } from '../../../types/Task';

export default function MetricsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [velocityPeriod, setVelocityPeriod] = useState<'week' | 'month' | 'quarter'>('month');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        const result = await window.taskAPI.getAllTasks();
        if (result.success && result.data) {
            setTasks(result.data);
        }
    };

    const metrics = useMemo(() => calculateMetrics(tasks), [tasks]);
    const velocityData = useMemo(() => generateVelocityData(tasks, velocityPeriod), [tasks, velocityPeriod]);
    const deadlineStats = useMemo(() => generateDeadlineStats(tasks), [tasks]);
    const insights = useMemo(() => generateInsights(tasks, metrics), [tasks, metrics]);

    return (
        <Box sx={{ p: 3 }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Metrics & Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track your productivity, analyze patterns, and discover improvement opportunities
                </Typography>
            </Box>

            {/* Overview Stats Grid */}
            <Stack direction="row" spacing={3} sx={{ mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <StatCard
                        title="Total Tasks"
                        value={metrics.totalTasks}
                        subtitle={`${metrics.activeTasks} active`}
                        icon={<AssignmentTurnedInIcon fontSize="large" />}
                        color="primary"
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <StatCard
                        title="Completion Rate"
                        value={`${metrics.completionRate.toFixed(1)}%`}
                        subtitle={`${metrics.completedTasks} completed`}
                        icon={<EmojiEventsIcon fontSize="large" />}
                        color={metrics.completionRate >= 70 ? 'success' : metrics.completionRate >= 50 ? 'warning' : 'error'}
                        trend={metrics.completionRate >= 70 ? 'up' : metrics.completionRate >= 50 ? 'flat' : 'down'}
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <StatCard
                        title="Deadline Adherence"
                        value={`${metrics.deadlineAdherenceRate.toFixed(1)}%`}
                        subtitle={`${metrics.onTimeCompletions} on-time`}
                        icon={<CalendarTodayIcon fontSize="large" />}
                        color={metrics.deadlineAdherenceRate >= 80 ? 'success' : metrics.deadlineAdherenceRate >= 60 ? 'warning' : 'error'}
                        trend={metrics.deadlineAdherenceRate >= 80 ? 'up' : metrics.deadlineAdherenceRate >= 60 ? 'flat' : 'down'}
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <StatCard
                        title="Daily Velocity"
                        value={metrics.averageTasksPerDay.toFixed(1)}
                        subtitle="tasks per day"
                        icon={<SpeedIcon fontSize="large" />}
                        color="info"
                    />
                </Box>
            </Stack>

            {/* Secondary Stats Grid */}
            <Stack direction="row" spacing={3} sx={{ mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <StatCard
                        title="This Week"
                        value={metrics.tasksCompletedThisWeek}
                        subtitle="tasks completed"
                        icon={<TrendingUpIcon fontSize="large" />}
                        color="success"
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <StatCard
                        title="Points Earned"
                        value={metrics.totalPointsEarned}
                        subtitle={`${metrics.pointEfficiencyRate.toFixed(0)}% efficiency`}
                        icon={<EmojiEventsIcon fontSize="large" />}
                        color="warning"
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <StatCard
                        title="Avg. Completion Time"
                        value={`${metrics.averageTimeToComplete.toFixed(1)}d`}
                        subtitle="days per task"
                        icon={<TimerIcon fontSize="large" />}
                        color="info"
                    />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <StatCard
                        title="Overdue Tasks"
                        value={metrics.overdueActive}
                        subtitle={`${metrics.upcomingDeadlines} due this week`}
                        icon={<WarningAmberIcon fontSize="large" />}
                        color={metrics.overdueActive > 0 ? 'error' : 'success'}
                    />
                </Box>
            </Stack>

            {/* Charts Row 1 */}
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
                <Box sx={{ flex: '1 1 66%' }}>
                    <VelocityChart
                        data={velocityData}
                        period={velocityPeriod}
                        onPeriodChange={setVelocityPeriod}
                    />
                </Box>
                <Box sx={{ flex: '1 1 34%' }}>
                    <StateDistributionChart
                        distribution={metrics.stateDistribution}
                        percentages={metrics.statePercentages}
                        totalTasks={metrics.totalTasks}
                    />
                </Box>
            </Stack>

            {/* Charts Row 2 */}
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
                <Box sx={{ flex: '1 1 50%' }}>
                    <DeadlineAdherenceChart
                        stats={deadlineStats}
                        onTimeCount={metrics.onTimeCompletions}
                        lateCount={metrics.lateCompletions}
                        adherenceRate={metrics.deadlineAdherenceRate}
                    />
                </Box>
                <Box sx={{ flex: '1 1 50%' }}>
                    <InsightsPanel insights={insights} />
                </Box>
            </Stack>

            {/* Additional Metrics Summary */}
            <Paper
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Quick Stats Summary
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: '150px', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            This Month
                        </Typography>
                        <Typography variant="h5" fontWeight={600}>
                            {metrics.tasksCompletedThisMonth}
                        </Typography>
                    </Box>
                    <Box sx={{ width: 1, bgcolor: 'divider' }} />
                    <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: '150px', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Failed Tasks
                        </Typography>
                        <Typography variant="h5" fontWeight={600} color="error.main">
                            {metrics.failedTasks} ({metrics.failureRate.toFixed(1)}%)
                        </Typography>
                    </Box>
                    <Box sx={{ width: 1, bgcolor: 'divider' }} />
                    <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: '150px', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Active Workload
                        </Typography>
                        <Typography variant="h5" fontWeight={600}>
                            {metrics.totalActivePoints} pts
                        </Typography>
                    </Box>
                    <Box sx={{ width: 1, bgcolor: 'divider' }} />
                    <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: '150px', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Est. Days to Clear
                        </Typography>
                        <Typography variant="h5" fontWeight={600}>
                            {metrics.estimatedDaysToComplete > 0 ? Math.ceil(metrics.estimatedDaysToComplete) : 'N/A'}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}
