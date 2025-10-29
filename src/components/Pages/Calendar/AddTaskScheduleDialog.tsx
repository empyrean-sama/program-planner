import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    Stack,
    Chip,
    Paper,
    alpha,
    TextField,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import {
    Close as CloseIcon,
    AccessTime as TimeIcon,
    CalendarMonth as CalendarIcon,
    Assignment as TaskIcon,
    TrendingFlat as ArrowIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Task } from '../../../types/Task';
import SearchableComboBox from '../../Common/SearchableComboBox';
import { useTheme } from '@mui/material/styles';

dayjs.extend(duration);

interface AddTaskScheduleDialogProps {
    open: boolean;
    initialDate?: Dayjs;
    initialHour?: number;
    initialTaskId?: string;
    taskReadonly?: boolean;
    onClose: () => void;
    onEntryAdded: () => void;
}

export default function AddTaskScheduleDialog({
    open,
    initialDate,
    initialHour,
    initialTaskId,
    taskReadonly = false,
    onClose,
    onEntryAdded,
}: AddTaskScheduleDialogProps) {
    const theme = useTheme();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    useEffect(() => {
        if (open) {
            loadTasks();
            
            // Set initial task if provided
            if (initialTaskId) {
                setSelectedTaskId(initialTaskId);
            }
            
            // Set initial times based on context
            if (initialDate && initialHour !== undefined) {
                const start = initialDate.hour(initialHour).minute(0).second(0);
                setStartTime(start);
                setEndTime(start.add(1, 'hour'));
            } else if (initialDate) {
                const start = initialDate.hour(9).minute(0).second(0);
                setStartTime(start);
                setEndTime(start.add(1, 'hour'));
            } else {
                setStartTime(dayjs());
                setEndTime(dayjs().add(1, 'hour'));
            }
        }
    }, [open, initialDate, initialHour, initialTaskId]);

    const loadTasks = async () => {
        setIsLoadingTasks(true);
        try {
            const result = await window.taskAPI.getAllTasks();
            if (result.success && result.data) {
                // Filter to only show tasks not in final states
                const finalStates = ['Removed', 'Finished', 'Deferred', 'Failed'];
                const activeTasks = result.data.filter(task => !finalStates.includes(task.state));
                setTasks(activeTasks);
            }
        } finally {
            setIsLoadingTasks(false);
        }
    };

    // Convert tasks to SearchableComboBox options
    const taskOptions = useMemo(() => {
        return tasks.map(task => ({
            value: task.id,
            label: task.title,
            subtitle: `${task.state}${task.estimatedTime ? ` • Est: ${task.estimatedTime} min` : ''}`,
        }));
    }, [tasks]);

    const handleClose = () => {
        setSelectedTaskId('');
        setStartTime(null);
        setEndTime(null);
        setError('');
        onClose();
    };

    const handleAdd = async () => {
        if (!selectedTaskId) {
            setError('Please select a task');
            return;
        }

        if (!startTime || !endTime) {
            setError('Both start and end times are required');
            return;
        }

        if (endTime.isBefore(startTime)) {
            setError('End time must be after start time');
            return;
        }

        setIsSubmitting(true);
        setError('');
        
        try {
            const result = await window.taskAPI.addScheduleEntry({
                taskId: selectedTaskId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            });

            if (result.success) {
                handleClose();
                onEntryAdded();
            } else {
                setError(result.error || 'Failed to add schedule entry');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    // Calculate duration between start and end times
    const durationMinutes = useMemo(() => {
        if (startTime && endTime) {
            return endTime.diff(startTime, 'minute');
        }
        return 0;
    }, [startTime, endTime]);

    // Format duration for display
    const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    // Handle start time change and adjust end time
    const handleStartTimeChange = (newStart: Dayjs | null) => {
        setStartTime(newStart);
        if (newStart && endTime && endTime.isBefore(newStart)) {
            setEndTime(newStart.add(1, 'hour'));
        }
    };

    // Handle end time change
    const handleEndTimeChange = (newEnd: Dayjs | null) => {
        setEndTime(newEnd);
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh',
                }
            }}
        >
            {/* Modern Header */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    p: 2.5,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 700,
                                mb: 0.5,
                                fontSize: '1.25rem',
                            }}
                        >
                            Schedule Task
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Add a time block to your calendar
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: 'error.main',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                    {/* Task Selection Section */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <TaskIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: 0.5,
                                }}
                            >
                                Select Task
                            </Typography>
                        </Box>
                        <SearchableComboBox
                            label=""
                            value={selectedTaskId}
                            options={taskOptions}
                            onChange={setSelectedTaskId}
                            placeholder="Search for a task..."
                            searchThreshold={5}
                            error={!!error && !selectedTaskId}
                            disabled={taskReadonly}
                        />
                    </Box>

                    {/* Task Details Preview */}
                    {selectedTask && (
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 2, 
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                border: 1,
                                borderColor: alpha(theme.palette.primary.main, 0.1),
                                borderRadius: 1.5,
                            }}
                        >
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    letterSpacing: 0.5,
                                }}
                            >
                                Selected Task
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    fontWeight: 600,
                                    mt: 0.5,
                                    mb: 1,
                                }}
                            >
                                {selectedTask.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                    label={selectedTask.state} 
                                    size="small"
                                    sx={{ 
                                        height: 22,
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                    }}
                                />
                                {selectedTask.estimatedTime && (
                                    <Chip 
                                        label={`Est: ${selectedTask.estimatedTime} min`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ 
                                            height: 22,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                )}
                            </Box>
                        </Paper>
                    )}

                    {/* Time Range Control */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <TimeIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: 0.5,
                                }}
                            >
                                Time Range
                            </Typography>
                        </Box>

                        {/* Custom Time Range Selector */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.default',
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Stack spacing={2}>
                                    {/* Date Display */}
                                    {startTime && (
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                gap: 1,
                                                p: 1.5,
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                borderRadius: 1,
                                            }}
                                        >
                                            <CalendarIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {startTime.format('dddd, MMMM D, YYYY')}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Time Selectors in a unified control */}
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 2,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {/* Start Time */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    display: 'block',
                                                    mb: 0.5,
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    fontSize: '0.7rem',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                Start
                                            </Typography>
                                            <DateTimePicker
                                                value={startTime}
                                                onChange={handleStartTimeChange}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: 'small',
                                                        sx: {
                                                            '& .MuiOutlinedInput-root': {
                                                                bgcolor: 'background.paper',
                                                                fontWeight: 600,
                                                            },
                                                        },
                                                    }
                                                }}
                                            />
                                        </Box>

                                        {/* Arrow Separator */}
                                        <ArrowIcon 
                                            sx={{ 
                                                mt: 2.5,
                                                color: 'text.secondary',
                                                fontSize: '1.5rem',
                                                flexShrink: 0,
                                            }} 
                                        />

                                        {/* End Time */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    display: 'block',
                                                    mb: 0.5,
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    fontSize: '0.7rem',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                End
                                            </Typography>
                                            <DateTimePicker
                                                value={endTime}
                                                onChange={handleEndTimeChange}
                                                minDateTime={startTime || undefined}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: 'small',
                                                        sx: {
                                                            '& .MuiOutlinedInput-root': {
                                                                bgcolor: 'background.paper',
                                                                fontWeight: 600,
                                                            },
                                                        },
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Duration Display */}
                                    {durationMinutes > 0 && (
                                        <Box 
                                            sx={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1,
                                                p: 1.5,
                                                bgcolor: alpha(theme.palette.success.main, 0.08),
                                                borderRadius: 1,
                                                border: 1,
                                                borderColor: alpha(theme.palette.success.main, 0.2),
                                            }}
                                        >
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'success.main',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Duration: {formatDuration(durationMinutes)}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </LocalizationProvider>
                        </Paper>
                    </Box>

                    {/* Error Display */}
                    {error && (
                        <Paper
                            elevation={0}
                            sx={{ 
                                p: 2, 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                borderRadius: 1.5,
                                border: 1,
                                borderColor: alpha(theme.palette.error.main, 0.3),
                            }}
                        >
                            <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                                {error}
                            </Typography>
                        </Paper>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions 
                sx={{ 
                    px: 3, 
                    py: 2.5, 
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderTop: 1,
                    borderColor: 'divider',
                    gap: 1,
                }}
            >
                <Button 
                    onClick={handleClose}
                    sx={{ 
                        minWidth: 100,
                        textTransform: 'none',
                        fontWeight: 500,
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleAdd} 
                    variant="contained"
                    disabled={!selectedTaskId || !startTime || !endTime || isSubmitting}
                    sx={{ 
                        minWidth: 120,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 2,
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                            Adding...
                        </>
                    ) : (
                        'Add Schedule'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
