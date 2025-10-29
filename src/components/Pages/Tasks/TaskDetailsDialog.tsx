import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    TextField,
    Box,
    Typography,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Task, TaskState } from '../../../types/Task';
import ScheduleEntryDialog from './ScheduleEntryDialog';
import CommentDialog from './CommentDialog';

interface TaskDetailsDialogProps {
    open: boolean;
    task: Task;
    onClose: () => void;
    onTaskUpdated: () => void;
    onTaskDeleted: () => void;
}

const taskStates: TaskState[] = ['Filed', 'Scheduled', 'Doing', 'Finished', 'Failed', 'Deferred', 'Removed'];
const finalStates: TaskState[] = ['Removed', 'Finished', 'Deferred', 'Failed'];

export default function TaskDetailsDialog({
    open,
    task,
    onClose,
    onTaskUpdated,
    onTaskDeleted,
}: TaskDetailsDialogProps) {
    const [editedTask, setEditedTask] = useState(task);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [pendingFinalState, setPendingFinalState] = useState<TaskState | null>(null);
    const [finalStateConfirmOpen, setFinalStateConfirmOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedTask(task);
    }, [task]);

    const handleFieldChange = (field: keyof Task, value: any) => {
        // Special handling for final state changes
        if (field === 'state' && value && finalStates.includes(value as TaskState)) {
            setPendingFinalState(value as TaskState);
            setFinalStateConfirmOpen(true);
            return; // Don't update immediately, wait for confirmation
        }
        
        setEditedTask(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const result = await window.taskAPI.updateTask({
            id: editedTask.id,
            title: editedTask.title,
            description: editedTask.description,
            state: editedTask.state,
            dueDateTime: editedTask.dueDateTime,
        });

        if (result.success) {
            onTaskUpdated();
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            const result = await window.taskAPI.deleteTask(task.id);
            if (result.success) {
                onTaskDeleted();
            }
        }
    };

    const handleRemoveScheduleEntry = async (entryId: string) => {
        const result = await window.taskAPI.removeScheduleEntry(task.id, entryId);
        if (result.success && result.data) {
            setEditedTask(result.data);
            onTaskUpdated();
        }
    };

    const handleScheduleAdded = async () => {
        setScheduleDialogOpen(false);
        const result = await window.taskAPI.getTaskById(task.id);
        if (result.success && result.data) {
            setEditedTask(result.data);
            onTaskUpdated();
        }
    };

    const handleCommentAdded = async () => {
        setCommentDialogOpen(false);
        const result = await window.taskAPI.getTaskById(task.id);
        if (result.success && result.data) {
            setEditedTask(result.data);
            onTaskUpdated();
        }
    };

    const handleConfirmFinalState = async () => {
        if (!pendingFinalState) return;
        
        setIsSaving(true);
        const result = await window.taskAPI.updateTask({
            id: editedTask.id,
            title: editedTask.title,
            description: editedTask.description,
            state: pendingFinalState,
            dueDateTime: editedTask.dueDateTime,
        });

        setIsSaving(false);
        
        if (result.success && result.data) {
            setEditedTask(result.data);
            setFinalStateConfirmOpen(false);
            setPendingFinalState(null);
            onTaskUpdated();
        }
    };

    const handleCancelFinalState = () => {
        setFinalStateConfirmOpen(false);
        setPendingFinalState(null);
    };

    const getScheduleEntriesImpact = (): { inProgress: number; future: number } => {
        const now = new Date();
        
        let inProgress = 0;
        let future = 0;
        
        editedTask.scheduleHistory.forEach(entry => {
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Task Details</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* Task ID (Read-only) */}
                    <TextField
                        label="Task ID"
                        fullWidth
                        value={editedTask.id}
                        InputProps={{ readOnly: true }}
                        size="small"
                    />

                    {/* Filing Date & Time (Read-only) */}
                    <TextField
                        label="Filing Date & Time"
                        fullWidth
                        value={dayjs(editedTask.filingDateTime).format('MMM D, YYYY h:mm A')}
                        InputProps={{ readOnly: true }}
                        size="small"
                    />

                    {/* State */}
                    <FormControl fullWidth size="small">
                        <InputLabel>State</InputLabel>
                        <Select
                            value={editedTask.state}
                            label="State"
                            onChange={(e) => handleFieldChange('state', e.target.value as TaskState)}
                        >
                            {taskStates.map(state => (
                                <MenuItem key={state} value={state}>{state}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Title */}
                    <TextField
                        label="Title"
                        fullWidth
                        value={editedTask.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                    />

                    {/* Description */}
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={editedTask.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                    />

                    {/* Due Date & Time */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Due Date & Time"
                            value={editedTask.dueDateTime ? dayjs(editedTask.dueDateTime) : null}
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

                    {/* Estimated Time (Read-only) */}
                    <TextField
                        label="Estimated Time (minutes)"
                        fullWidth
                        value={editedTask.estimatedTime || 'Not specified'}
                        InputProps={{ readOnly: true }}
                        size="small"
                    />

                    {/* Points (Read-only) */}
                    <TextField
                        label="Points"
                        fullWidth
                        value={editedTask.points}
                        InputProps={{ readOnly: true }}
                        size="small"
                    />

                    {/* Elapsed Time (Read-only) */}
                    <TextField
                        label="Elapsed Time (minutes)"
                        fullWidth
                        value={editedTask.elapsedTime}
                        InputProps={{ readOnly: true }}
                        size="small"
                    />

                    <Divider />

                    {/* Schedule History */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Schedule History</Typography>
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setScheduleDialogOpen(true)}
                            >
                                Add Entry
                            </Button>
                        </Box>
                        
                        {editedTask.scheduleHistory.length > 0 ? (
                            <TableContainer component={Paper} variant="outlined">
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
                                        {[...editedTask.scheduleHistory]
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
                    </Box>

                    <Divider />

                    {/* Comments */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Comments</Typography>
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setCommentDialogOpen(true)}
                            >
                                Add Comment
                            </Button>
                        </Box>
                        
                        {editedTask.comments.length > 0 ? (
                            <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                {editedTask.comments.map((comment) => (
                                    <ListItem key={comment.id} divider>
                                        <ListItemText
                                            primary={comment.text}
                                            secondary={dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No comments yet
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDelete} color="error">
                    Delete
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button onClick={onClose}>Close</Button>
                <Button onClick={handleSave} variant="contained">
                    Save Changes
                </Button>
            </DialogActions>

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
                        {isSaving ? 'Saving...' : 'Confirm & Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
}
