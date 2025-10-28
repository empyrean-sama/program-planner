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
import { useParams, useNavigate } from 'react-router';
import { Task, TaskState } from '../../../types/Task';
import ScheduleEntryDialog from './ScheduleEntryDialog';
import CommentDialog from './CommentDialog';

const taskStates: TaskState[] = ['Filed', 'Scheduled', 'Doing', 'Finished', 'Failed', 'Deferred', 'Removed'];

export default function TaskDetailsPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);

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

    const handleFieldChange = (field: keyof Task, value: any) => {
        if (!task) return;
        setTask(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = async () => {
        if (!task) return;

        const result = await window.taskAPI.updateTask({
            id: task.id,
            title: task.title,
            description: task.description,
            state: task.state,
            dueDateTime: task.dueDateTime,
        });

        if (result.success) {
            loadTask();
        }
    };

    const handleDelete = async () => {
        if (!task) return;
        
        if (window.confirm('Are you sure you want to delete this task?')) {
            const result = await window.taskAPI.deleteTask(task.id);
            if (result.success) {
                navigate('/tasks');
            }
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
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tasks')} sx={{ mt: 2 }}>
                    Back to Tasks
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, overflow: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <IconButton onClick={() => navigate('/tasks')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flex: 1 }}>Task Details</Typography>
                <Button onClick={handleDelete} color="error" variant="outlined">
                    Delete Task
                </Button>
                <Button onClick={handleSave} variant="contained">
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

                            {/* State */}
                            <FormControl fullWidth size="small">
                                <InputLabel>State</InputLabel>
                                <Select
                                    value={task.state}
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
                                value={task.title}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                            />

                            {/* Description */}
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                value={task.description}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
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
                                        <ListItem>
                                            <ListItemText
                                                primary={comment.text}
                                                secondary={dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}
                                            />
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
