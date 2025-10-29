import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Chip,
    Paper,
    Stack,
    Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import { Story } from '../../../types/Story';
import { Task } from '../../../types/Task';
import useAppGlobalState from '../../../hooks/useAppGlobalState';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

interface BurndownDataPoint {
    date: string;
    remainingPoints: number;
    idealPoints: number;
}

export default function StoryMetricsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useAppGlobalState();
    
    const [story, setStory] = useState<Story | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadStory();
            loadTasks();
        }
    }, [id]);

    const loadStory = async () => {
        if (!id) return;
        
        try {
            const result = await window.storyAPI.getStoryById(id);
            if (result.success && result.data) {
                setStory(result.data);
            } else {
                showToast(result.error || 'Failed to load story', 'error');
                navigate('/stories');
            }
        } catch (error) {
            showToast('An error occurred while loading story', 'error');
            navigate('/stories');
        }
    };

    const loadTasks = async () => {
        if (!id) return;
        
        try {
            const result = await window.storyAPI.getTasks(id);
            if (result.success && result.data) {
                setTasks(result.data);
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate burndown data
    const burndownData = useMemo(() => {
        if (!story || tasks.length === 0) return [];

        const startDate = new Date(story.filingDateTime);
        const today = new Date();
        const endDate = story.finishedAt ? new Date(story.finishedAt) : today;

        // Get all task completion dates
        const completionEvents = tasks
            .filter(t => t.state === 'Finished')
            .map(t => ({
                date: new Date(t.filingDateTime), // Approximation - would need actual completion date
                points: t.points,
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        const data: BurndownDataPoint[] = [];
        const totalPoints = story.totalPoints;
        let currentDate = new Date(startDate);
        let remainingPoints = totalPoints;
        let eventIndex = 0;

        // Calculate ideal burndown (linear)
        const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const pointsPerDay = totalPoints / totalDays;

        while (currentDate <= endDate) {
            // Process completion events for this date
            while (
                eventIndex < completionEvents.length &&
                completionEvents[eventIndex].date <= currentDate
            ) {
                remainingPoints -= completionEvents[eventIndex].points;
                eventIndex++;
            }

            const daysSinceStart = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const idealRemaining = Math.max(0, totalPoints - (pointsPerDay * daysSinceStart));

            data.push({
                date: currentDate.toISOString().split('T')[0],
                remainingPoints: Math.max(0, remainingPoints),
                idealPoints: idealRemaining,
            });

            // Move to next day
            currentDate = new Date(currentDate.getTime() + 1000 * 60 * 60 * 24);
        }

        return data;
    }, [story, tasks]);

    // Calculate velocity metrics
    const velocityMetrics = useMemo(() => {
        if (!story || tasks.length === 0) {
            return {
                completedTasksCount: 0,
                averagePointsPerTask: 0,
                totalDays: 0,
                pointsPerDay: 0,
                estimatedDaysRemaining: 0,
            };
        }

        const completedTasks = tasks.filter(t => t.state === 'Finished');
        const startDate = new Date(story.startedAt || story.filingDateTime);
        const today = new Date();
        const totalDays = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        const avgPointsPerTask = completedTasks.length > 0
            ? story.completedPoints / completedTasks.length
            : 0;
        
        const pointsPerDay = totalDays > 0 ? story.completedPoints / totalDays : 0;
        const remainingPoints = story.totalPoints - story.completedPoints;
        const estimatedDaysRemaining = pointsPerDay > 0 ? Math.ceil(remainingPoints / pointsPerDay) : 0;

        return {
            completedTasksCount: completedTasks.length,
            averagePointsPerTask: avgPointsPerTask,
            totalDays,
            pointsPerDay,
            estimatedDaysRemaining,
        };
    }, [story, tasks]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!story) {
        return null;
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate(`/stories/${story.id}`)} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
                        Story Metrics: {story.title}
                    </Typography>
                    <Chip
                        label={story.state}
                        color={story.state === 'Running' ? 'primary' : story.state === 'Finished' ? 'success' : 'default'}
                    />
                </Box>
            </Box>

            {/* Key Stats */}
            <Stack direction="row" spacing={3} sx={{ mb: 4, flexWrap: 'wrap' }}>
                <Card sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
                                <EmojiEventsIcon />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Progress
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    {story.progress}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {story.completedPoints} / {story.totalPoints} pts
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'success.main', borderRadius: 2, color: 'white' }}>
                                <SpeedIcon />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Velocity
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    {velocityMetrics.pointsPerDay.toFixed(1)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    points per day
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'info.main', borderRadius: 2, color: 'white' }}>
                                <TimerIcon />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Days Elapsed
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    {velocityMetrics.totalDays}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    since start
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'warning.main', borderRadius: 2, color: 'white' }}>
                                <TrendingDownIcon />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Est. Remaining
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    {velocityMetrics.estimatedDaysRemaining}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    days to finish
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Stack>

            {/* Burndown Chart */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Burndown Chart
                    </Typography>
                    
                    {burndownData.length > 0 ? (
                        <BurndownChart data={burndownData} totalPoints={story.totalPoints} />
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography color="text.secondary">
                                No burndown data available yet
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Task Breakdown */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Task Breakdown
                    </Typography>
                    
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">Total Tasks</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {tasks.length}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">Completed Tasks</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {velocityMetrics.completedTasksCount} ({((velocityMetrics.completedTasksCount / Math.max(1, tasks.length)) * 100).toFixed(0)}%)
                                </Typography>
                                <Chip
                                    label={`${story.completedPoints} pts`}
                                    size="small"
                                    color="success"
                                />
                            </Box>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">Average Points per Task</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {velocityMetrics.averagePointsPerTask.toFixed(1)}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">Remaining Points</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                {story.totalPoints - story.completedPoints}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

// Burndown Chart Component
interface BurndownChartProps {
    data: BurndownDataPoint[];
    totalPoints: number;
}

function BurndownChart({ data, totalPoints }: BurndownChartProps) {
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxPoints = Math.max(totalPoints, ...data.map(d => d.remainingPoints));

    // Scale functions
    const xScale = (index: number) => (index / Math.max(1, data.length - 1)) * chartWidth;
    const yScale = (points: number) => chartHeight - (points / maxPoints) * chartHeight;

    // Create path for actual burndown
    const actualPath = data
        .map((d, i) => {
            const x = xScale(i);
            const y = yScale(d.remainingPoints);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

    // Create path for ideal burndown
    const idealPath = data
        .map((d, i) => {
            const x = xScale(i);
            const y = yScale(d.idealPoints);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

    // Y-axis ticks
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxPoints / yTicks) * i);

    return (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
                <g transform={`translate(${padding.left}, ${padding.top})`}>
                    {/* Grid lines */}
                    {yTickValues.map((value, i) => (
                        <g key={i}>
                            <line
                                x1={0}
                                y1={yScale(value)}
                                x2={chartWidth}
                                y2={yScale(value)}
                                stroke="#e0e0e0"
                                strokeDasharray="2,2"
                            />
                            <text
                                x={-10}
                                y={yScale(value)}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                fontSize="12"
                                fill="#666"
                            >
                                {Math.round(value)}
                            </text>
                        </g>
                    ))}

                    {/* Axes */}
                    <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" strokeWidth={2} />
                    <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#333" strokeWidth={2} />

                    {/* Ideal burndown line */}
                    <path
                        d={idealPath}
                        fill="none"
                        stroke="#90caf9"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                    />

                    {/* Actual burndown line */}
                    <path
                        d={actualPath}
                        fill="none"
                        stroke="#1976d2"
                        strokeWidth={3}
                    />

                    {/* Data points */}
                    {data.map((d, i) => (
                        <circle
                            key={i}
                            cx={xScale(i)}
                            cy={yScale(d.remainingPoints)}
                            r={4}
                            fill="#1976d2"
                        />
                    ))}

                    {/* X-axis labels (show every few days) */}
                    {data.filter((_, i) => i % Math.ceil(data.length / 10) === 0 || i === data.length - 1).map((d, idx, arr) => {
                        const originalIndex = data.indexOf(d);
                        return (
                            <text
                                key={originalIndex}
                                x={xScale(originalIndex)}
                                y={chartHeight + 20}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#666"
                            >
                                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </text>
                        );
                    })}

                    {/* Axis labels */}
                    <text
                        x={chartWidth / 2}
                        y={chartHeight + 35}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#333"
                        fontWeight="600"
                    >
                        Date
                    </text>
                    <text
                        x={-chartHeight / 2}
                        y={-45}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#333"
                        fontWeight="600"
                        transform={`rotate(-90, -${chartHeight / 2}, -45)`}
                    >
                        Remaining Points
                    </text>
                </g>
            </svg>

            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 24, height: 3, bgcolor: '#1976d2' }} />
                    <Typography variant="body2">Actual</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 24, height: 3, bgcolor: '#90caf9', borderTop: '2px dashed #90caf9' }} />
                    <Typography variant="body2">Ideal</Typography>
                </Box>
            </Box>
        </Box>
    );
}
