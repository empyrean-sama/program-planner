import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Task, TaskState } from '../../../types/Task';
import ScheduleEntryDialog from './ScheduleEntryDialog';
import CommentDialog from './CommentDialog';
import MarkdownTextarea from '../../Common/MarkdownTextarea';

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
    const locationState = location.state as LocationState | null;
    const [task, setTask] = useState<Task | null>(null);
    const [originalTask, setOriginalTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [saveError, setSaveError] = useState<string>('');

    const handleBack = () => {
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
    useEffect(() => {
        loadTask();
    }, [taskId]);

    const loadTask = async () => {
        if (!taskId) return;
        
        setLoading(true);
        const result = await window.taskAPI.getTaskById(taskId);
        if (result.success && result.data) {
            setTask(result.data);
            setOriginalTask(result.data);
        }
        setLoading(false);
    };

    const hasChanges = (): boolean => {
        if (!task || !originalTask) return false;
        
        return (
            task.title !== originalTask.title ||
            task.description !== originalTask.description ||
            task.state !== originalTask.state ||
            task.dueDateTime !== originalTask.dueDateTime
        );
    };

    const isInFinalState = (): boolean => {
        if (!originalTask) return false;
        return finalStates.includes(originalTask.state);
    };

    const handleFieldChange = (field: keyof Task, value: any) => {
        if (!task) return;
        setTask(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = async () => {
        if (!task) return;

        setSaveError('');
        const result = await window.taskAPI.updateTask({
            id: task.id,
            title: task.title,
            description: task.description,
            state: task.state,
            dueDateTime: task.dueDateTime,
        });

        if (result.success) {
            loadTask();
        } else {
            setSaveError(result.error || 'Failed to save task');
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, overflow: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <IconButton onClick={handleBack}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flex: 1 }}>Task Details</Typography>
                <Button 
                    onClick={handleSave} 
                    variant="contained"
                    disabled={!hasChanges()}
                >
                    Save Changes
                </Button>
            </Box>

            <Box sx={{ maxWidth: 1200, width: '100%', mx: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Basic Information */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Task ID (Read-only) */}
                            <TextField
                                label="Task ID"
                                fullWidth
                                value={task.id}
                                InputProps={{ readOnly: true }}
                                size="small"
                            />

                            {/* Filing Date & Time (Read-only) */}
                            <TextField
                                label="Filing Date & Time"
                                fullWidth
                                value={dayjs(task.filingDateTime).format('MMM D, YYYY h:mm A')}
                                InputProps={{ readOnly: true }}
                                size="small"
                            />

                            {/* State - System-managed display with user override option */}
                            <Box>
                                <TextField
                                    label="Current State"
                                    fullWidth
                                    value={task.state}
                                    InputProps={{ readOnly: true }}
                                    size="small"
                                    helperText="State is automatically managed by the system. You can override to final states below."
                                />
                            </Box>

                            {/* User State Override - Only show final states */}
                            <FormControl fullWidth size="small" disabled={isInFinalState()}>
                                <InputLabel>Set Final State (Optional)</InputLabel>
                                <Select
                                    value={userSettableStates.includes(task.state) ? task.state : ''}
                                    label="Set Final State (Optional)"
                                    onChange={(e) => handleFieldChange('state', e.target.value as TaskState)}
                                >
                                    <MenuItem value="">
                                        <em>Keep system-managed state</em>
                                    </MenuItem>
                                    {userSettableStates.map((state: TaskState) => (
                                        <MenuItem key={state} value={state}>{state}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {saveError && (
                                <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
                                    <Typography variant="body2">{saveError}</Typography>
                                </Box>
                            )}

                            {/* Title */}
                            <TextField
                                label="Title"
                                fullWidth
                                value={task.title}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                            />

                            {/* Description */}
                            <MarkdownTextarea
                                label="Description"
                                value={task.description}
                                onChange={(value) => handleFieldChange('description', value)}
                                rows={6}
                                placeholder="Enter task description... Supports markdown formatting"
                            />

                            {/* Due Date & Time */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Due Date & Time"
                                    value={task.dueDateTime ? dayjs(task.dueDateTime) : null}
                                    onChange={(newValue: Dayjs | null) => 
                                        handleFieldChange('dueDateTime', newValue?.toISOString())
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: 'small',
                                        }
                                    }}
                                />
                            </LocalizationProvider>

                            {/* Read-only fields */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <TextField
                                    label="Estimated Time (minutes)"
                                    value={task.estimatedTime || 'Not specified'}
                                    InputProps={{ readOnly: true }}
                                    size="small"
                                />
                                <TextField
                                    label="Points"
                                    value={task.points}
                                    InputProps={{ readOnly: true }}
                                    size="small"
                                />
                                <TextField
                                    label="Elapsed Time (minutes)"
                                    value={task.elapsedTime}
                                    InputProps={{ readOnly: true }}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Paper>

                    {/* Schedule History */}
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Schedule History</Typography>
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
                                            <TableCell>Start Time</TableCell>
                                            <TableCell>End Time</TableCell>
                                            <TableCell>Duration (mins)</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {task.scheduleHistory.map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell>
                                                    {dayjs(entry.startTime).format('MMM D, YYYY h:mm A')}
                                                </TableCell>
                                                <TableCell>
                                                    {dayjs(entry.endTime).format('MMM D, YYYY h:mm A')}
                                                </TableCell>
                                                <TableCell>{entry.duration}</TableCell>
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
                    </Paper>

                    {/* Comments */}
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Comments</Typography>
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
                            <List>
                                {task.comments.map((comment, index) => (
                                    <React.Fragment key={comment.id}>
                                        <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <MarkdownTextarea
                                                value={comment.text}
                                                onChange={() => {}} // Read-only
                                                disabled
                                                rows={1}
                                                fullWidth
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                {dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}
                                            </Typography>
                                        </ListItem>
                                        {index < task.comments.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No comments yet
                            </Typography>
                        )}
                    </Paper>
                </Box>
            </Box>

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
        </Box>
    );
}
