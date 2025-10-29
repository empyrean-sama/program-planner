import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import { DeadlineStats } from '../../../utils/metricsCalculation';

export interface DeadlineAdherenceChartProps {
    stats: DeadlineStats[];
    onTimeCount: number;
    lateCount: number;
    adherenceRate: number;
}

export function DeadlineAdherenceChart({ stats, onTimeCount, lateCount, adherenceRate }: DeadlineAdherenceChartProps) {
    const theme = useTheme();

    const totalCompleted = onTimeCount + lateCount;

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Early':
                return theme.palette.success.light;
            case 'On Time':
                return theme.palette.success.main;
            case 'Late':
                return theme.palette.error.main;
            default:
                return theme.palette.grey[500];
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Early':
                return <CheckCircleIcon sx={{ color: 'success.light' }} />;
            case 'On Time':
                return <ScheduleIcon sx={{ color: 'success.main' }} />;
            case 'Late':
                return <WarningIcon sx={{ color: 'error.main' }} />;
            default:
                return null;
        }
    };

    if (totalCompleted === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Deadline Adherence
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                        <Typography variant="body2" color="text.secondary">
                            No completed tasks with deadlines yet
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                        Deadline Adherence
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" fontWeight={600} color={adherenceRate >= 80 ? 'success.main' : adherenceRate >= 60 ? 'warning.main' : 'error.main'}>
                            {adherenceRate.toFixed(0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            On-time rate
                        </Typography>
                    </Box>
                </Box>

                {/* Stacked horizontal bar */}
                <Box sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            height: 40,
                            borderRadius: 1,
                            overflow: 'hidden',
                            boxShadow: theme.shadows[1],
                        }}
                    >
                        {stats.map((stat) => {
                            if (stat.percentage === 0) return null;
                            return (
                                <Box
                                    key={stat.category}
                                    sx={{
                                        width: `${stat.percentage}%`,
                                        bgcolor: getCategoryColor(stat.category),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            filter: 'brightness(1.1)',
                                        },
                                    }}
                                    title={`${stat.category}: ${stat.count} tasks (${stat.percentage.toFixed(1)}%)`}
                                >
                                    {stat.percentage > 10 && (
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            sx={{ color: 'white' }}
                                        >
                                            {stat.count}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Detailed breakdown */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {stats.map((stat) => (
                        <Box
                            key={stat.category}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1.5,
                                borderRadius: 1,
                                border: `1px solid`,
                                borderColor: 'divider',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: getCategoryColor(stat.category),
                                    bgcolor: (theme) => `${getCategoryColor(stat.category)}10`,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {getCategoryIcon(stat.category)}
                                <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                        {stat.category}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {stat.category === 'Early' && 'Completed 2+ days before deadline'}
                                        {stat.category === 'On Time' && 'Completed within 2 days of deadline'}
                                        {stat.category === 'Late' && 'Completed after deadline'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" fontWeight={600}>
                                        {stat.count}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        tasks
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    sx={{
                                        minWidth: 60,
                                        textAlign: 'right',
                                        color: getCategoryColor(stat.category),
                                    }}
                                >
                                    {stat.percentage.toFixed(1)}%
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Summary stats */}
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        display: 'flex',
                        justifyContent: 'space-around',
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={600} color="success.main">
                            {onTimeCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            On-time completions
                        </Typography>
                    </Box>
                    <Box sx={{ width: 1, bgcolor: 'divider' }} />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={600} color="error.main">
                            {lateCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Late completions
                        </Typography>
                    </Box>
                    <Box sx={{ width: 1, bgcolor: 'divider' }} />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={600}>
                            {totalCompleted}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total completed
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
