import { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Box, Typography, Stack, Card, CardContent, Chip, IconButton, LinearProgress, Fade, Skeleton, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Task, TaskState } from '../../../types/Task';
import { Story } from '../../../types/Story';

export default function HomePage() {
    const theme = useTheme();
    const navigate = useNavigate();
    
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            // Use Promise.all for parallel fetching
            const [tasksResult, storiesResult] = await Promise.all([
                window.taskAPI.getAllTasks(),
                window.storyAPI.getAllStories()
            ]);
            
            if (tasksResult.success && tasksResult.data) {
                setTasks(tasksResult.data);
            }
            if (storiesResult.success && storiesResult.data) {
                setStories(storiesResult.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            // Small delay to prevent flash of loading screen
            setTimeout(() => setLoading(false), 100);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getRecentTasks = useMemo(() => 
        tasks.filter(t => t.state !== 'Finished').slice(0, 3),
        [tasks]
    );
    
    const getActiveStories = useMemo(() => 
        stories.filter(s => s.state === 'Running').slice(0, 3),
        [stories]
    );
    
    const activeTasks = useMemo(() => 
        tasks.filter(t => t.state !== 'Finished').length,
        [tasks]
    );
    
    const completedTasks = useMemo(() => 
        tasks.filter(t => t.state === 'Finished').length,
        [tasks]
    );
    
    const activeStories = useMemo(() => 
        stories.filter(s => s.state === 'Running').length,
        [stories]
    );
    
    const completionRate = useMemo(() => 
        tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        [tasks.length, completedTasks]
    );

    const getTaskStateColor = (state: TaskState) => {
        if (state === 'Finished') return 'success';
        if (state === 'Doing') return 'primary';
        if (state === 'Failed') return 'error';
        return 'default';
    };
    
    if (loading) {
        return (
            <Box sx={{ height: '100%', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="text.secondary">Loading your workspace...</Typography>
                </Stack>
            </Box>
        );
    }
    
    return (
        <Box sx={{ bgcolor: 'background.default' }}>
            <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', py: 6, px: 3 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                        Welcome to Program Planner
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                        Your intelligent task and project management companion
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                        <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">{activeTasks}</Typography>
                                <Typography variant="body2" color="text.secondary">Active Tasks</Typography>
                            </CardContent>
                        </Card>
                        <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main">{completedTasks}</Typography>
                                <Typography variant="body2" color="text.secondary">Completed</Typography>
                            </CardContent>
                        </Card>
                        <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="info.main">{activeStories}</Typography>
                                <Typography variant="body2" color="text.secondary">Active Stories</Typography>
                            </CardContent>
                        </Card>
                        <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main">{completionRate}%</Typography>
                                <Typography variant="body2" color="text.secondary">Completion</Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Container>
            </Box>
            <Container maxWidth="lg" sx={{ py: 4, pb: 6 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Quick Actions</Typography>
                        <Stack spacing={2}>
                            {[
                                { title: 'Calendar', desc: 'View and manage your schedule', icon: CalendarMonthIcon, path: '/calendar', color: 'primary.main', textColor: 'primary.contrastText' },
                                { title: 'Tasks', desc: 'Track and manage your tasks', icon: AssignmentIcon, path: '/tasks', color: 'secondary.main', textColor: 'secondary.contrastText' },
                                { title: 'Stories', desc: 'Group tasks into user stories', icon: AutoStoriesIcon, path: '/stories', color: 'success.main', textColor: 'success.contrastText' },
                                { title: 'Metrics', desc: 'Analyze your productivity', icon: BarChartIcon, path: '/metrics', color: 'info.main', textColor: 'info.contrastText' }
                            ].map(item => (
                                <Card key={item.path} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate(item.path)}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ 
                                                width: 48, 
                                                height: 48, 
                                                borderRadius: 2, 
                                                bgcolor: item.color, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                color: item.textColor 
                                            }}>
                                                <item.icon />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                                                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                            </Box>
                                            <IconButton><ArrowForwardIcon /></IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>Recent Tasks</Typography>
                                    <IconButton size="small" onClick={() => navigate('/tasks')}><ArrowForwardIcon /></IconButton>
                                </Box>
                                <Stack spacing={1.5}>
                                    {getRecentTasks.length > 0 ? getRecentTasks.map(task => (
                                        <Card key={task.id} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate(`/tasks/${task.id}`)}>
                                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>{task.title}</Typography>
                                                    <Chip label={task.state} size="small" color={getTaskStateColor(task.state)} />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {task.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    )) : (
                                        <Card variant="outlined"><CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography variant="body2" color="text.secondary">No recent tasks</Typography>
                                        </CardContent></Card>
                                    )}
                                </Stack>
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>Active Stories</Typography>
                                    <IconButton size="small" onClick={() => navigate('/stories')}><ArrowForwardIcon /></IconButton>
                                </Box>
                                <Stack spacing={1.5}>
                                    {getActiveStories.length > 0 ? getActiveStories.map(story => (
                                        <Card key={story.id} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate(`/stories/${story.id}`)}>
                                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{story.title}</Typography>
                                                    <Chip label={`${story.progress}%`} size="small" color="primary" />
                                                </Box>
                                                <LinearProgress variant="determinate" value={story.progress} sx={{ height: 6, borderRadius: 1, mb: 1 }} />
                                                <Typography variant="caption" color="text.secondary">{story.taskIds.length} tasks  {story.completedPoints}/{story.totalPoints} points</Typography>
                                            </CardContent>
                                        </Card>
                                    )) : (
                                        <Card variant="outlined"><CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography variant="body2" color="text.secondary">No active stories</Typography>
                                        </CardContent></Card>
                                    )}
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}
