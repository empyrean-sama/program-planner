import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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

    useEffect(() => {
        setEditedTask(task);
    }, [task]);

    const handleFieldChange = (field: keyof Task, value: any) => {
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
                                        {editedTask.scheduleHistory.map((entry) => (
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
        </Dialog>
    );
}
