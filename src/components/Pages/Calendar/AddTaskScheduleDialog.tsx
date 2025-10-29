import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Task } from '../../../types/Task';
import SearchableComboBox from '../../Common/SearchableComboBox';

interface AddTaskScheduleDialogProps {
    open: boolean;
    initialDate?: Dayjs;
    initialHour?: number;
    onClose: () => void;
    onEntryAdded: () => void;
}

export default function AddTaskScheduleDialog({
    open,
    initialDate,
    initialHour,
    onClose,
    onEntryAdded,
}: AddTaskScheduleDialogProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            loadTasks();
            
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
    }, [open, initialDate, initialHour]);

    const loadTasks = async () => {
        const result = await window.taskAPI.getAllTasks();
        if (result.success && result.data) {
            // Filter to only show tasks not in final states
            const finalStates = ['Removed', 'Finished', 'Deferred', 'Failed'];
            const activeTasks = result.data.filter(task => !finalStates.includes(task.state));
            setTasks(activeTasks);
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
    };

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Task Schedule</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* Task Selection */}
                    <SearchableComboBox
                        label="Select Task"
                        value={selectedTaskId}
                        options={taskOptions}
                        onChange={setSelectedTaskId}
                        placeholder="Search tasks..."
                        searchThreshold={5}
                        error={!!error && !selectedTaskId}
                    />

                    {/* Show task details if selected */}
                    {selectedTask && (
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Task Details
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {selectedTask.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                State: {selectedTask.state}
                                {selectedTask.estimatedTime && ` • Est: ${selectedTask.estimatedTime} min`}
                            </Typography>
                        </Box>
                    )}

                    {/* Time Selection */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Start Time"
                            value={startTime}
                            onChange={(newValue: Dayjs | null) => setStartTime(newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                }
                            }}
                        />
                        <DateTimePicker
                            label="End Time"
                            value={endTime}
                            onChange={(newValue: Dayjs | null) => setEndTime(newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                }
                            }}
                        />
                    </LocalizationProvider>

                    {/* Error Display */}
                    {error && (
                        <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
                            <Typography variant="body2">{error}</Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleAdd} variant="contained">
                    Add Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
}
