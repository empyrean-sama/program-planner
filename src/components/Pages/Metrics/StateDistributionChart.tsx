import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import { TaskState } from '../../../types/Task';
import { useMemo } from 'react';

export interface StateDistributionChartProps {
    distribution: Record<TaskState, number>;
    percentages: Record<TaskState, number>;
    totalTasks: number;
}

const STATE_COLORS: Record<TaskState, string> = {
    Filed: '#9E9E9E',
    Scheduled: '#2196F3',
    Doing: '#FF9800',
    Finished: '#4CAF50',
    Failed: '#F44336',
    Deferred: '#9C27B0',
    Removed: '#607D8B',
};

const STATE_LABELS: Record<TaskState, string> = {
    Filed: 'Filed',
    Scheduled: 'Scheduled',
    Doing: 'In Progress',
    Finished: 'Completed',
    Failed: 'Failed',
    Deferred: 'Deferred',
    Removed: 'Removed',
};

export function StateDistributionChart({ distribution, percentages, totalTasks }: StateDistributionChartProps) {
    const theme = useTheme();

    const statesWithTasks = useMemo(() => {
        return (Object.keys(distribution) as TaskState[])
            .filter(state => distribution[state] > 0)
            .sort((a, b) => distribution[b] - distribution[a]);
    }, [distribution]);

    const { svgPath, segments } = useMemo(() => {
        const centerX = 100;
        const centerY = 100;
        const radius = 80;
        const innerRadius = 50;

        let currentAngle = -90; // Start at top
        const segments: Array<{
            state: TaskState;
            path: string;
            percentage: number;
            count: number;
            startAngle: number;
            endAngle: number;
        }> = [];

        statesWithTasks.forEach(state => {
            const percentage = percentages[state];
            const sweepAngle = (percentage / 100) * 360;
            const endAngle = currentAngle + sweepAngle;

            const startRad = (currentAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);

            const innerX1 = centerX + innerRadius * Math.cos(startRad);
            const innerY1 = centerY + innerRadius * Math.sin(startRad);
            const innerX2 = centerX + innerRadius * Math.cos(endRad);
            const innerY2 = centerY + innerRadius * Math.sin(endRad);

            const largeArcFlag = sweepAngle > 180 ? 1 : 0;

            const path = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${innerX2} ${innerY2}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
                'Z',
            ].join(' ');

            segments.push({
                state,
                path,
                percentage,
                count: distribution[state],
                startAngle: currentAngle,
                endAngle,
            });

            currentAngle = endAngle;
        });

        return { svgPath: '', segments };
    }, [statesWithTasks, percentages, distribution]);

    if (totalTasks === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Task Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography variant="body2" color="text.secondary">
                            No tasks to display
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Task Distribution
                </Typography>

                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', mt: 3 }}>
                    {/* Donut Chart */}
                    <Box sx={{ flex: '0 0 240px', position: 'relative' }}>
                        <svg width="240" height="240" viewBox="0 0 200 200">
                            {segments.map((segment, index) => (
                                <g key={segment.state}>
                                    <path
                                        d={segment.path}
                                        fill={STATE_COLORS[segment.state]}
                                        opacity={0.9}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'opacity 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = '0.9';
                                        }}
                                    >
                                        <title>
                                            {STATE_LABELS[segment.state]}: {segment.count} tasks ({segment.percentage.toFixed(1)}%)
                                        </title>
                                    </path>
                                </g>
                            ))}
                            
                            {/* Center text */}
                            <text
                                x="100"
                                y="95"
                                textAnchor="middle"
                                fontSize="32"
                                fontWeight="600"
                                fill={theme.palette.text.primary}
                            >
                                {totalTasks}
                            </text>
                            <text
                                x="100"
                                y="115"
                                textAnchor="middle"
                                fontSize="14"
                                fill={theme.palette.text.secondary}
                            >
                                Total Tasks
                            </text>
                        </svg>
                    </Box>

                    {/* Legend */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {statesWithTasks.map(state => (
                            <Box
                                key={state}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1,
                                    borderRadius: 1,
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                        bgcolor: alpha(STATE_COLORS[state], 0.1),
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                    <Box
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 0.5,
                                            bgcolor: STATE_COLORS[state],
                                        }}
                                    />
                                    <Typography variant="body2" fontWeight={500}>
                                        {STATE_LABELS[state]}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {distribution[state]}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            minWidth: 50,
                                            textAlign: 'right',
                                            color: STATE_COLORS[state],
                                        }}
                                    >
                                        {percentages[state].toFixed(1)}%
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
