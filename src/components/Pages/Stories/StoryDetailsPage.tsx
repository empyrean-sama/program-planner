import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    LinearProgress,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Cancel as CancelIcon,
    RemoveCircle as RemoveCircleIcon,
    Pause as PauseIcon,
    BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import { Story } from '../../../types/Story';
import { Task, TaskState } from '../../../types/Task';
import useAppGlobalState from '../../../hooks/useAppGlobalState';
import AddTasksToStoryDialog from './AddTasksToStoryDialog';
import CreateTaskFromStoryDialog from './CreateTaskFromStoryDialog';

export default function StoryDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useAppGlobalState();
    
    const [story, setStory] = useState<Story | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    
    const [addTasksDialogOpen, setAddTasksDialogOpen] = useState(false);
    const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadStory();
            loadTasks();
        }
    }, [id]);

    const loadStory = async () => {
        if (!id) return;
        
        setLoading(true);
        try {
            const result = await window.storyAPI.getStoryById(id);
            if (result.success && result.data) {
                setStory(result.data);
                setEditTitle(result.data.title);
                setEditDescription(result.data.description);
            } else {
                showToast(result.error || 'Failed to load story', 'error');
                navigate('/stories');
            }
        } catch (error) {
            showToast('An error occurred while loading story', 'error');
            navigate('/stories');
        } finally {
            setLoading(false);
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
        }
    };

    const handleUpdateStory = async () => {
        if (!story || !editTitle.trim()) {
            showToast('Story title is required', 'error');
            return;
        }

        try {
            const result = await window.storyAPI.updateStory({
                id: story.id,
                title: editTitle,
                description: editDescription,
            });

            if (result.success) {
                showToast('Story updated successfully', 'success');
                setEditDialogOpen(false);
                loadStory();
            } else {
                showToast(result.error || 'Failed to update story', 'error');
            }
        } catch (error) {
            showToast('An error occurred while updating story', 'error');
        }
    };

    const handleDeleteStory = async () => {
        if (!story) return;

        try {
            const result = await window.storyAPI.deleteStory(story.id);
            if (result.success) {
                showToast('Story deleted successfully', 'success');
                navigate('/stories');
            } else {
                showToast(result.error || 'Failed to delete story', 'error');
            }
        } catch (error) {
            showToast('An error occurred while deleting story', 'error');
        }
    };

    const handleRemoveTaskFromStory = async (taskId: string) => {
        if (!story) return;

        try {
            const result = await window.storyAPI.removeTask({
                storyId: story.id,
                taskId,
            });

            if (result.success) {
                showToast('Task removed from story', 'success');
                loadStory();
                loadTasks();
            } else {
                showToast(result.error || 'Failed to remove task', 'error');
            }
        } catch (error) {
            showToast('An error occurred while removing task', 'error');
        }
    };

    const getStateColor = (state: string): 'default' | 'primary' | 'success' => {
        switch (state) {
            case 'Filed': return 'default';
            case 'Running': return 'primary';
            case 'Finished': return 'success';
            default: return 'default';
        }
    };

    const getTaskStateIcon = (state: TaskState) => {
        switch (state) {
            case 'Filed': return <ScheduleIcon fontSize="small" />;
            case 'Scheduled': return <ScheduleIcon fontSize="small" />;
            case 'Doing': return <ScheduleIcon fontSize="small" color="primary" />;
            case 'Finished': return <CheckCircleIcon fontSize="small" color="success" />;
            case 'Failed': return <ErrorIcon fontSize="small" color="error" />;
            case 'Deferred': return <PauseIcon fontSize="small" />;
            case 'Removed': return <RemoveCircleIcon fontSize="small" />;
            default: return null;
        }
    };

    const getTaskStateColor = (state: TaskState): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
        switch (state) {
            case 'Doing': return 'primary';
            case 'Finished': return 'success';
            case 'Failed': return 'error';
            case 'Deferred': return 'warning';
            default: return 'default';
        }
    };

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
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/stories')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
                        {story.title}
                    </Typography>
                    <Chip
                        label={story.state}
                        color={getStateColor(story.state)}
                        sx={{ mr: 2 }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<BarChartIcon />}
                        onClick={() => navigate(`/stories/${story.id}/metrics`)}
                        sx={{ mr: 1 }}
                    >
                        Metrics
                    </Button>
                    <IconButton onClick={() => setEditDialogOpen(true)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </Box>

                {story.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, ml: 6 }}>
                        {story.description}
                    </Typography>
                )}

                {/* Progress Section */}
                <Card sx={{ ml: 6 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Progress</Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                                {story.progress}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={story.progress}
                            sx={{ height: 8, borderRadius: 4, mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Tasks
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {story.taskIds.length}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Points
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {story.completedPoints} / {story.totalPoints}
                                </Typography>
                            </Box>
                            {story.startedAt && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Started
                                    </Typography>
                                    <Typography variant="body2">
                                        {new Date(story.startedAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            )}
                            {story.finishedAt && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Finished
                                    </Typography>
                                    <Typography variant="body2">
                                        {new Date(story.finishedAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Tasks Section */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Tasks ({tasks.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setAddTasksDialogOpen(true)}
                        >
                            Add Existing Tasks
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateTaskDialogOpen(true)}
                        >
                            Create Task
                        </Button>
                    </Box>
                </Box>

                {tasks.length === 0 ? (
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No tasks in this story
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Add existing tasks or create new ones to get started
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onRemove={() => handleRemoveTaskFromStory(task.id)}
                                onClick={() => navigate(`/tasks?taskId=${task.id}`)}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* Edit Story Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Story</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Title"
                            fullWidth
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateStory} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
                <DialogTitle>Delete Story?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this story? Tasks will not be deleted.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteStory} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Placeholder for Add Tasks Dialog */}
            {addTasksDialogOpen && (
                <AddTasksToStoryDialog
                    storyId={story.id}
                    existingTaskIds={story.taskIds}
                    open={addTasksDialogOpen}
                    onClose={() => setAddTasksDialogOpen(false)}
                    onTasksAdded={() => {
                        loadStory();
                        loadTasks();
                    }}
                />
            )}

            {/* Placeholder for Create Task Dialog */}
            {createTaskDialogOpen && (
                <CreateTaskFromStoryDialog
                    storyId={story.id}
                    open={createTaskDialogOpen}
                    onClose={() => setCreateTaskDialogOpen(false)}
                    onTaskCreated={() => {
                        loadStory();
                        loadTasks();
                    }}
                />
            )}
        </Box>
    );
}

// Task Card Component
interface TaskCardProps {
    task: Task;
    onRemove: () => void;
    onClick: () => void;
}

function TaskCard({ task, onRemove, onClick }: TaskCardProps) {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const getTaskStateIcon = (state: TaskState) => {
        switch (state) {
            case 'Filed': return <ScheduleIcon fontSize="small" />;
            case 'Scheduled': return <ScheduleIcon fontSize="small" />;
            case 'Doing': return <ScheduleIcon fontSize="small" color="primary" />;
            case 'Finished': return <CheckCircleIcon fontSize="small" color="success" />;
            case 'Failed': return <ErrorIcon fontSize="small" color="error" />;
            case 'Deferred': return <PauseIcon fontSize="small" />;
            case 'Removed': return <RemoveCircleIcon fontSize="small" />;
            default: return null;
        }
    };

    const getTaskStateColor = (state: TaskState): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
        switch (state) {
            case 'Doing': return 'primary';
            case 'Finished': return 'success';
            case 'Failed': return 'error';
            case 'Deferred': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1 }} onClick={onClick}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {task.title}
                            </Typography>
                            <Chip
                                icon={getTaskStateIcon(task.state)}
                                label={task.state}
                                size="small"
                                color={getTaskStateColor(task.state)}
                            />
                            <Chip
                                label={`${task.points} pts`}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                        {task.description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {task.description}
                            </Typography>
                        )}
                    </Box>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuAnchor(e.currentTarget);
                        }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                    >
                        <MenuItem
                            onClick={() => {
                                setMenuAnchor(null);
                                onRemove();
                            }}
                        >
                            <ListItemIcon>
                                <CancelIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Remove from Story</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </CardContent>
        </Card>
    );
}
