import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Card,
    CardContent,
    Tooltip,
    LinearProgress,
    Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Task, TaskState } from '../../../types/Task';
import { Story } from '../../../types/Story';
import ScheduleEntryDialog from './ScheduleEntryDialog';
import CommentDialog from './CommentDialog';
import MarkdownTextarea from '../../Common/MarkdownTextarea';
import TaskRelationships from './TaskRelationships';
import { getTaskCardAppearance, getWarningMessages } from '../../../services/TaskCardRulesEngine';
import useAppGlobalState from '../../../hooks/useAppGlobalState';

// User can only set these states
const userSettableStates: TaskState[] = ['Removed', 'Finished', 'Deferred', 'Failed'];

// Final states that cannot be changed once saved
const finalStates: TaskState[] = ['Removed', 'Finished', 'Deferred', 'Failed'];

interface LocationState {
    from?: string;
    calendarView?: 'month' | 'week' | 'day';
    calendarDate?: string;
}

export default function TaskDetailsPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useAppGlobalState();
    const locationState = location.state as LocationState | null;
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [story, setStory] = useState<Story | null>(null);
    const [stories, setStories] = useState<Story[]>([]); // Stories this task belongs to
    const [allStories, setAllStories] = useState<Story[]>([]);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [storyDialogOpen, setStoryDialogOpen] = useState(false);
    const [saveError, setSaveError] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState('');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Final state confirmation
    const [pendingFinalState, setPendingFinalState] = useState<TaskState | null>(null);
    const [finalStateConfirmOpen, setFinalStateConfirmOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        loadTask();
        loadAllStories();
    }, [taskId]);

    useEffect(() => {
        if (task?.storyIds && task.storyIds.length > 0) {
            loadStories(task.storyIds);
        } else {
            setStories([]);
        }
    }, [task?.storyIds]);

    const loadTask = async () => {
        if (!taskId) return;
        
        setLoading(true);
        const result = await window.taskAPI.getTaskById(taskId);
        if (result.success && result.data) {
            setTask(result.data);
            setTitleValue(result.data.title);
        }
        setLoading(false);
    };

    const loadStories = async (storyIds: string[]) => {
        const loadedStories: Story[] = [];
        for (const id of storyIds) {
            const result = await window.storyAPI.getStoryById(id);
            if (result.success && result.data) {
                loadedStories.push(result.data);
            }
        }
        setStories(loadedStories);
    };

    const loadAllStories = async () => {
        const result = await window.storyAPI.getAllStories();
        if (result.success && result.data) {
            setAllStories(result.data.filter(s => s.state !== 'Finished'));
        }
    };

    const isInFinalState = (): boolean => {
        if (!task) return false;
        return finalStates.includes(task.state);
    };

    // Auto-save function with debouncing
    const saveTask = useCallback(async (updatedTask: Task) => {
        if (!updatedTask) return;

        setIsSaving(true);
        setSaveError('');
        const result = await window.taskAPI.updateTask({
            id: updatedTask.id,
            title: updatedTask.title,
            description: updatedTask.description,
            state: updatedTask.state,
            dueDateTime: updatedTask.dueDateTime,
        });

        setIsSaving(false);
        if (!result.success) {
            setSaveError(result.error || 'Failed to save task');
            // Reload to restore valid state
            loadTask();
        }
    }, []);

    // Debounced save for text fields (500ms delay)
    const debouncedSave = useCallback((updatedTask: Task) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveTask(updatedTask);
        }, 500);
    }, [saveTask]);

    // Immediate save for non-text fields
    const immediateSave = useCallback((updatedTask: Task) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTask(updatedTask);
    }, [saveTask]);

    // Handle field changes with appropriate save strategy
    const handleFieldChange = (field: keyof Task, value: any, immediate: boolean = false) => {
        if (!task) return;
        
        // Special handling for final state changes
        if (field === 'state' && value && finalStates.includes(value as TaskState)) {
            setPendingFinalState(value as TaskState);
            setFinalStateConfirmOpen(true);
            setHasUnsavedChanges(true);
            return; // Don't save immediately, wait for confirmation
        }
        
        const updatedTask = { ...task, [field]: value };
        setTask(updatedTask);

        // Use immediate save for dropdowns/pickers, debounced for text
        if (immediate) {
            immediateSave(updatedTask);
        } else {
            debouncedSave(updatedTask);
        }
    };

    // Save on blur for text fields
    const handleBlur = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        if (task) {
            saveTask(task);
        }
    };

    // Save on page navigation/unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Save before navigating away
    const handleBack = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        if (task) {
            saveTask(task).then(() => {
                navigateBack();
            });
        } else {
            navigateBack();
        }
    };

    const navigateBack = () => {
        // If we came from calendar, navigate back to calendar with the correct view and date
        if (locationState?.from === '/calendar' && locationState.calendarView && locationState.calendarDate) {
            navigate('/calendar', {
                state: {
                    view: locationState.calendarView,
                    date: locationState.calendarDate,
                },
            });
        } else {
            // Default to tasks page
            navigate('/tasks');
        }
    };

    const handleRemoveScheduleEntry = async (entryId: string) => {
        if (!task) return;
        
        const result = await window.taskAPI.removeScheduleEntry(task.id, entryId);
        if (result.success && result.data) {
            setTask(result.data);
        }
    };

    const handleScheduleAdded = async () => {
        setScheduleDialogOpen(false);
        loadTask();
    };

    const handleCommentAdded = async () => {
        setCommentDialogOpen(false);
        loadTask();
    };

    const handleConfirmFinalState = async () => {
        if (!task || !pendingFinalState) return;
        
        setIsSaving(true);
        setSaveError('');
        
        const result = await window.taskAPI.updateTask({
            id: task.id,
            title: task.title,
            description: task.description,
            state: pendingFinalState,
            dueDateTime: task.dueDateTime,
        });

        setIsSaving(false);
        
        if (result.success && result.data) {
            // Close dialog and reload to show removed future entries
            setFinalStateConfirmOpen(false);
            setPendingFinalState(null);
            setHasUnsavedChanges(false);
            
            // Reload the task to see the updated state and removed future entries
            await loadTask();
        } else {
            setSaveError(result.error || 'Failed to update task state');
        }
    };

    const handleCancelFinalState = () => {
        setFinalStateConfirmOpen(false);
        setPendingFinalState(null);
        setHasUnsavedChanges(false);
    };

    const handleSaveTitle = async () => {
        if (!task || !titleValue.trim()) {
            showToast('Title cannot be empty', 'error');
            setTitleValue(task?.title || '');
            setEditingTitle(false);
            return;
        }
        
        const updatedTask = { ...task, title: titleValue.trim() };
        setTask(updatedTask);
        setEditingTitle(false);
        await saveTask(updatedTask);
    };

    const handleAddToStory = async (storyId: string) => {
        if (!task) return;
        
        try {
            const result = await window.taskAPI.addToStory(task.id, storyId);
            if (result.success && result.data) {
                setTask(result.data);
                showToast('Task added to story', 'success');
                loadAllStories();
            } else {
                showToast(result.error || 'Failed to add to story', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    };

    const handleRemoveFromStory = async (storyId: string) => {
        if (!task) return;
        
        try {
            const result = await window.taskAPI.removeFromStory(task.id, storyId);
            if (result.success && result.data) {
                setTask(result.data);
                showToast('Task removed from story', 'success');
                loadAllStories();
            } else {
                showToast(result.error || 'Failed to remove from story', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    };

    const getTaskStateColor = (state: TaskState): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
        switch (state) {
            case 'Doing': return 'primary';
            case 'Scheduled': return 'primary';
            case 'Finished': return 'success';
            case 'Failed': return 'error';
            case 'Deferred': return 'warning';
            default: return 'default';
        }
    };

    const getScheduleEntriesImpact = (): { inProgress: number; future: number } => {
        if (!task) return { inProgress: 0, future: 0 };
        const now = new Date();
        
        let inProgress = 0;
        let future = 0;
        
        task.scheduleHistory.forEach(entry => {
            const entryStart = new Date(entry.startTime);
            const entryEnd = new Date(entry.endTime);
            
            if (entryStart <= now && entryEnd > now) {
                // Entry is in progress
                inProgress++;
            } else if (entryStart > now) {
                // Entry is purely future
                future++;
            }
        });
        
        return { inProgress, future };
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!task) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h5">Task not found</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
                    Back
                </Button>
            </Box>
        );
    }

    // Get task appearance and warnings
    const appearance = getTaskCardAppearance(task);
    const warningMessages = getWarningMessages(appearance.warnings);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header with Task Title */}
            <Box 
                sx={{ 
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    px: 3,
                    py: 2,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                }}
            >
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <IconButton onClick={handleBack} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                        
                        {editingTitle ? (
                            <TextField
                                fullWidth
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                                onBlur={handleSaveTitle}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveTitle();
                                    if (e.key === 'Escape') {
                                        setTitleValue(task.title);
                                        setEditingTitle(false);
                                    }
                                }}
                                autoFocus
                                variant="standard"
                                sx={{ 
                                    '& .MuiInputBase-input': { 
                                        fontSize: '1.75rem',
                                        fontWeight: 600,
                                    }
                                }}
                            />
                        ) : (
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    flex: 1,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    '&:hover': { color: 'primary.main' }
                                }}
                                onClick={() => setEditingTitle(true)}
                            >
                                {task.title}
                            </Typography>
                        )}
                        
                        <Tooltip title="Edit title">
                            <IconButton size="small" onClick={() => setEditingTitle(true)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        
                        {isSaving && <CircularProgress size={20} />}
                    </Box>
                    
                    {/* Metadata Row */}
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Chip 
                            label={task.state} 
                            color={getTaskStateColor(task.state)}
                            size="small"
                        />
                        <Chip 
                            label={`${task.points} points`} 
                            variant="outlined"
                            size="small"
                        />
                        {task.estimatedTime && (
                            <Chip 
                                label={`Est: ${task.estimatedTime}m`} 
                                variant="outlined"
                                size="small"
                            />
                        )}
                        <Typography variant="caption" color="text.secondary">
                            Filed: {dayjs(task.filingDateTime).format('MMM D, YYYY')}
                        </Typography>
                        
                        {/* Story Badges */}
                        {stories.length > 0 ? (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                {stories.map((s) => (
                                    <Chip
                                        key={s.id}
                                        icon={<AutoStoriesIcon />}
                                        label={s.title}
                                        onClick={() => navigate(`/stories/${s.id}`)}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                                <Button
                                    startIcon={<AutoStoriesIcon />}
                                    onClick={() => setStoryDialogOpen(true)}
                                    size="small"
                                    variant="text"
                                >
                                    Manage
                                </Button>
                            </Box>
                        ) : (
                            <Button
                                startIcon={<AutoStoriesIcon />}
                                onClick={() => setStoryDialogOpen(true)}
                                size="small"
                                variant="outlined"
                            >
                                Add to Story
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                {/* Warnings */}
                {warningMessages.length > 0 && (
                    <Alert 
                        severity={(appearance.warnings.overdue || appearance.warnings.scheduleBeyondDueDate) ? 'error' : 'warning'}
                        icon={<WarningAmberIcon />}
                        sx={{ mb: 3 }}
                    >
                        {warningMessages.map((message, idx) => (
                            <Typography key={idx} variant="body2">
                                • {message}
                            </Typography>
                        ))}
                    </Alert>
                )}

                {/* Progress Bar for Active Tasks */}
                {appearance.metrics.hasEstimate && appearance.metrics.hasSchedule && 
                 ['Scheduled', 'Doing'].includes(task.state) && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Time Progress
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {task.elapsedTime}m / {task.estimatedTime}m 
                                    ({Math.round(appearance.metrics.progressPercentage)}%)
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(100, appearance.metrics.progressPercentage)}
                                color={appearance.metrics.exceedsEstimate 
                                    ? 'error' 
                                    : appearance.metrics.progressPercentage > 80 
                                        ? 'warning' 
                                        : 'success'}
                                sx={{ height: 8, borderRadius: 1 }}
                            />
                        </CardContent>
                    </Card>
                )}

                <Stack spacing={3}>
                    {/* Description & Details */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Description
                            </Typography>
                            <MarkdownTextarea
                                value={task.description}
                                onChange={(value) => handleFieldChange('description', value)}
                                onBlur={handleBlur}
                                rows={6}
                                placeholder="Enter task description... Supports markdown formatting"
                            />
                            
                            <Divider sx={{ my: 3 }} />
                            
                            {/* Due Date */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Due Date & Time
                                </Typography>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        value={task.dueDateTime ? dayjs(task.dueDateTime) : null}
                                        onChange={(newValue: Dayjs | null) => 
                                            handleFieldChange('dueDateTime', newValue?.toISOString(), true)
                                        }
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: 'small',
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            {/* State Management */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    State Management
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Current state is system-managed. Override to final state if needed.
                                </Typography>
                                <FormControl fullWidth size="small" disabled={isInFinalState()}>
                                    <InputLabel>Set Final State</InputLabel>
                                    <Select
                                        value={pendingFinalState || (userSettableStates.includes(task.state) ? task.state : '')}
                                        label="Set Final State"
                                        onChange={(e) => handleFieldChange('state', e.target.value as TaskState, true)}
                                    >
                                        <MenuItem value="">
                                            <em>Keep system-managed</em>
                                        </MenuItem>
                                        {userSettableStates.map((state: TaskState) => (
                                            <MenuItem key={state} value={state}>{state}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                {hasUnsavedChanges && pendingFinalState && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Final state change to <strong>{pendingFinalState}</strong> is pending confirmation.
                                        </Typography>
                                    </Alert>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Schedule History */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Schedule History
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => setScheduleDialogOpen(true)}
                                    variant="contained"
                                >
                                    Add Entry
                                </Button>
                            </Box>
                            
                            {task.scheduleHistory.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Start</TableCell>
                                                <TableCell>End</TableCell>
                                                <TableCell>Duration</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {[...task.scheduleHistory]
                                                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                                                .map((entry) => (
                                                <TableRow key={entry.id}>
                                                    <TableCell>
                                                        {dayjs(entry.startTime).format('MMM D, h:mm A')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {dayjs(entry.endTime).format('MMM D, h:mm A')}
                                                    </TableCell>
                                                    <TableCell>{entry.duration}m</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveScheduleEntry(entry.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No schedule entries yet
                                </Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Comments
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCommentDialogOpen(true)}
                                    variant="contained"
                                >
                                    Add Comment
                                </Button>
                            </Box>
                            
                            {task.comments.length > 0 ? (
                                <Stack spacing={2} divider={<Divider />}>
                                    {task.comments.map((comment) => (
                                        <Box key={comment.id}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {comment.text}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                {dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No comments yet
                                </Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Task Relationships */}
                    <Card>
                        <CardContent>
                            <TaskRelationships task={task} onUpdate={loadTask} />
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            {/* Dialogs */}
            <ScheduleEntryDialog
                open={scheduleDialogOpen}
                taskId={task.id}
                onClose={() => setScheduleDialogOpen(false)}
                onEntryAdded={handleScheduleAdded}
            />

            <CommentDialog
                open={commentDialogOpen}
                taskId={task.id}
                onClose={() => setCommentDialogOpen(false)}
                onCommentAdded={handleCommentAdded}
            />

            {/* Story Assignment Dialog */}
            <Dialog open={storyDialogOpen} onClose={() => setStoryDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Manage Story Assignments
                </DialogTitle>
                <DialogContent>
                    {/* Current Stories */}
                    {stories.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Currently assigned to {stories.length} {stories.length === 1 ? 'story' : 'stories'}:
                            </Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                {stories.map((s) => (
                                    <Card key={s.id} variant="outlined">
                                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {s.title}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                        <Chip label={`${s.progress}% complete`} size="small" color="primary" />
                                                        <Chip label={`${s.taskIds.length} tasks`} size="small" variant="outlined" />
                                                    </Box>
                                                </Box>
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/stories/${s.id}`)}
                                                        title="View story"
                                                    >
                                                        <OpenInNewIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveFromStory(s.id)}
                                                        title="Remove from story"
                                                    >
                                                        <LinkOffIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </Box>
                    )}
                    
                    {/* Add to New Story */}
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Add to another story:
                        </Typography>
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel>Select Story</InputLabel>
                            <Select
                                value=""
                                label="Select Story"
                                onChange={(e) => {
                                    handleAddToStory(e.target.value);
                                    e.target.value = '';
                                }}
                            >
                                {allStories
                                    .filter((s) => !task.storyIds.includes(s.id))
                                    .map((s) => (
                                        <MenuItem key={s.id} value={s.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                <Typography sx={{ flex: 1 }}>{s.title}</Typography>
                                                <Chip label={s.state} size="small" />
                                            </Box>
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStoryDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <ScheduleEntryDialog
                open={scheduleDialogOpen}
                taskId={task.id}
                onClose={() => setScheduleDialogOpen(false)}
                onEntryAdded={handleScheduleAdded}
            />

            <CommentDialog
                open={commentDialogOpen}
                taskId={task.id}
                onClose={() => setCommentDialogOpen(false)}
                onCommentAdded={handleCommentAdded}
            />

            {/* Final State Confirmation Dialog */}
            <Dialog
                open={finalStateConfirmOpen}
                onClose={handleCancelFinalState}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Confirm Final State Change
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                            This action cannot be undone!
                        </Typography>
                    </Alert>
                    
                    <DialogContentText>
                        You are about to set this task to <strong>{pendingFinalState}</strong> state. 
                        This is a final state and cannot be changed once saved.
                    </DialogContentText>
                    
                    {(() => {
                        const impact = getScheduleEntriesImpact();
                        const hasImpact = impact.inProgress > 0 || impact.future > 0;
                        
                        if (!hasImpact) return null;
                        
                        return (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    {impact.inProgress > 0 && (
                                        <div>
                                            <strong>{impact.inProgress}</strong> in-progress schedule {impact.inProgress === 1 ? 'entry' : 'entries'} will be updated to end now.
                                        </div>
                                    )}
                                    {impact.future > 0 && (
                                        <div>
                                            <strong>{impact.future}</strong> future schedule {impact.future === 1 ? 'entry' : 'entries'} will be removed.
                                        </div>
                                    )}
                                </Typography>
                            </Alert>
                        );
                    })()}
                    
                    <DialogContentText sx={{ mt: 2 }}>
                        Are you sure you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelFinalState} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmFinalState} 
                        variant="contained" 
                        color="warning"
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={16} /> : null}
                    >
                        {isSaving ? 'Saving...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
