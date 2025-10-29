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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Task, TaskState } from '../../../types/Task';
import ScheduleEntryDialog from './ScheduleEntryDialog';
import CommentDialog from './CommentDialog';
import MarkdownTextarea from '../../Common/MarkdownTextarea';
import { getTaskCardAppearance, getWarningMessages } from '../../../services/TaskCardRulesEngine';

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
    const [loading, setLoading] = useState(true);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [saveError, setSaveError] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Final state confirmation
    const [pendingFinalState, setPendingFinalState] = useState<TaskState | null>(null);
    const [finalStateConfirmOpen, setFinalStateConfirmOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        loadTask();
    }, [taskId]);

    const loadTask = async () => {
        if (!taskId) return;
        
        setLoading(true);
        const result = await window.taskAPI.getTaskById(taskId);
        if (result.success && result.data) {
            setTask(result.data);
        }
        setLoading(false);
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

    // Get task appearance and warnings
    const appearance = getTaskCardAppearance(task);
    const warningMessages = getWarningMessages(appearance.warnings);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, overflow: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <IconButton onClick={handleBack}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flex: 1 }}>Task Details</Typography>
                {isSaving && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">Saving...</Typography>
                    </Box>
                )}
            </Box>

            {/* Warnings Section */}
            {warningMessages.length > 0 && (
                <Alert 
                    severity={(appearance.warnings.overdue || appearance.warnings.scheduleBeyondDueDate) ? 'error' : 'warning'}
                    icon={<WarningAmberIcon />}
                    sx={{ mb: 3 }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Task Warnings
                    </Typography>
                    {warningMessages.map((message, idx) => (
                        <Typography key={idx} variant="body2">
                            • {message}
                        </Typography>
                    ))}
                </Alert>
            )}

            {/* Progress Metrics for Scheduled/Doing tasks */}
            {appearance.metrics.hasEstimate && appearance.metrics.hasSchedule && 
             ['Scheduled', 'Doing'].includes(task.state) && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">
                            Progress Tracking
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {task.elapsedTime}m / {task.estimatedTime}m 
                            ({Math.round(appearance.metrics.progressPercentage)}%)
                        </Typography>
                    </Box>
                    <Box 
                        sx={{ 
                            width: '100%', 
                            height: 8, 
                            bgcolor: 'rgba(0,0,0,0.1)', 
                            borderRadius: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Box 
                            sx={{ 
                                width: `${Math.min(100, appearance.metrics.progressPercentage)}%`,
                                height: '100%',
                                bgcolor: appearance.metrics.exceedsEstimate 
                                    ? 'error.main' 
                                    : appearance.metrics.progressPercentage > 80 
                                        ? 'warning.main' 
                                        : 'success.main',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </Box>
                </Paper>
            )}

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
                                    value={pendingFinalState || (userSettableStates.includes(task.state) ? task.state : '')}
                                    label="Set Final State (Optional)"
                                    onChange={(e) => handleFieldChange('state', e.target.value as TaskState, true)}
                                >
                                    <MenuItem value="">
                                        <em>Keep system-managed state</em>
                                    </MenuItem>
                                    {userSettableStates.map((state: TaskState) => (
                                        <MenuItem key={state} value={state}>{state}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {hasUnsavedChanges && pendingFinalState && (
                                <Alert severity="info">
                                    <Typography variant="body2">
                                        Final state change to <strong>{pendingFinalState}</strong> is pending. 
                                        Please confirm in the dialog to save this change.
                                    </Typography>
                                </Alert>
                            )}

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
                                onBlur={handleBlur}
                            />

                            {/* Description */}
                            <MarkdownTextarea
                                label="Description"
                                value={task.description}
                                onChange={(value) => handleFieldChange('description', value)}
                                onBlur={handleBlur}
                                rows={6}
                                placeholder="Enter task description... Supports markdown formatting"
                            />

                            {/* Due Date & Time */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Due Date & Time"
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
                                        {[...task.scheduleHistory]
                                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                            .map((entry) => (
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
