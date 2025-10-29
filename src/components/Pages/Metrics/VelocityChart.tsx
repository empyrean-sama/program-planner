import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, alpha, useTheme } from '@mui/material';
import { VelocityDataPoint } from '../../../utils/metricsCalculation';
import { useMemo } from 'react';

export interface VelocityChartProps {
    data: VelocityDataPoint[];
    period: 'week' | 'month' | 'quarter';
    onPeriodChange: (period: 'week' | 'month' | 'quarter') => void;
}

export function VelocityChart({ data, period, onPeriodChange }: VelocityChartProps) {
    const theme = useTheme();

    const maxValue = useMemo(() => {
        const maxCompleted = Math.max(...data.map(d => d.completed), 1);
        const maxFailed = Math.max(...data.map(d => d.failed), 1);
        return Math.max(maxCompleted, maxFailed);
    }, [data]);

    const handlePeriodChange = (_event: React.MouseEvent<HTMLElement>, newPeriod: 'week' | 'month' | 'quarter' | null) => {
        if (newPeriod !== null) {
            onPeriodChange(newPeriod);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                        Task Completion Velocity
                    </Typography>
                    <ToggleButtonGroup
                        value={period}
                        exclusive
                        onChange={handlePeriodChange}
                        size="small"
                    >
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                        <ToggleButton value="quarter">Quarter</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Legend */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 0.5 }} />
                        <Typography variant="body2">Completed</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: 0.5 }} />
                        <Typography variant="body2">Failed</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                            sx={{ 
                                width: 16, 
                                height: 2, 
                                bgcolor: 'primary.main',
                                borderRadius: 0.5 
                            }} 
                        />
                        <Typography variant="body2">Cumulative</Typography>
                    </Box>
                </Box>

                {/* Chart */}
                <Box sx={{ position: 'relative', height: 300, mt: 2 }}>
                    {/* Y-axis grid lines and labels */}
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 30, width: '100%' }}>
                        {[0, 1, 2, 3, 4].map((i) => {
                            const value = Math.ceil(maxValue * (4 - i) / 4);
                            const top = `${(i * 25)}%`;
                            return (
                                <Box key={i} sx={{ position: 'absolute', left: 0, right: 0, top }}>
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ position: 'absolute', left: -35, top: -8 }}
                                    >
                                        {value}
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            height: 1, 
                                            bgcolor: 'divider',
                                            opacity: 0.3,
                                            ml: 5,
                                        }} 
                                    />
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Bars */}
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            left: 40,
                            right: 0,
                            top: 0,
                            bottom: 30,
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 0.5,
                        }}
                    >
                        {data.map((point, index) => {
                            const completedHeight = (point.completed / maxValue) * 100;
                            const failedHeight = (point.failed / maxValue) * 100;
                            const barWidth = `${(100 / data.length) - 0.5}%`;

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        width: barWidth,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        position: 'relative',
                                    }}
                                >
                                    {/* Completed bar */}
                                    {point.completed > 0 && (
                                        <Box
                                            sx={{
                                                width: '45%',
                                                height: `${completedHeight}%`,
                                                bgcolor: 'success.main',
                                                borderRadius: '2px 2px 0 0',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: 'success.dark',
                                                },
                                                position: 'relative',
                                            }}
                                            title={`${point.date}: ${point.completed} completed`}
                                        >
                                            {point.completed > 0 && completedHeight > 10 && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        left: 0,
                                                        right: 0,
                                                        textAlign: 'center',
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {point.completed}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    {/* Failed bar */}
                                    {point.failed > 0 && (
                                        <Box
                                            sx={{
                                                width: '45%',
                                                height: `${failedHeight}%`,
                                                bgcolor: 'error.main',
                                                borderRadius: '2px 2px 0 0',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: 'error.dark',
                                                },
                                                position: 'relative',
                                            }}
                                            title={`${point.date}: ${point.failed} failed`}
                                        >
                                            {point.failed > 0 && failedHeight > 10 && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        left: 0,
                                                        right: 0,
                                                        textAlign: 'center',
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {point.failed}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}

                        {/* Cumulative line overlay */}
                        <svg
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                            }}
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <polyline
                                points={data.map((point, index) => {
                                    const x = ((index + 0.5) / data.length) * 100;
                                    const maxCumulative = Math.max(...data.map(d => d.cumulative), 1);
                                    const y = 100 - (point.cumulative / maxCumulative) * 100;
                                    return `${x},${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke={theme.palette.primary.main}
                                strokeWidth="0.5"
                                opacity="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                            {data.map((point, index) => {
                                const x = ((index + 0.5) / data.length) * 100;
                                const maxCumulative = Math.max(...data.map(d => d.cumulative), 1);
                                const y = 100 - (point.cumulative / maxCumulative) * 100;
                                return (
                                    <circle
                                        key={index}
                                        cx={x}
                                        cy={y}
                                        r="1"
                                        fill={theme.palette.primary.main}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })}
                        </svg>
                    </Box>

                    {/* X-axis labels */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 40,
                            right: 0,
                            bottom: 0,
                            height: 30,
                            display: 'flex',
                            alignItems: 'flex-end',
                        }}
                    >
                        {data.map((point, index) => {
                            // Show every nth label based on data length
                            const showLabel = period === 'week' 
                                ? true 
                                : period === 'month' 
                                    ? index % 3 === 0 
                                    : index % 10 === 0;

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        width: `${100 / data.length}%`,
                                        textAlign: 'center',
                                    }}
                                >
                                    {showLabel && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                            {point.date}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
