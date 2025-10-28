import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface ScheduleEntryDialogProps {
    open: boolean;
    taskId: string;
    onClose: () => void;
    onEntryAdded: () => void;
}

export default function ScheduleEntryDialog({
    open,
    taskId,
    onClose,
    onEntryAdded,
}: ScheduleEntryDialogProps) {
    const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());
    const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().add(1, 'hour'));
    const [error, setError] = useState('');

    const handleClose = () => {
        setStartTime(dayjs());
        setEndTime(dayjs().add(1, 'hour'));
        setError('');
        onClose();
    };

    const handleAdd = async () => {
        if (!startTime || !endTime) {
            setError('Both start and end times are required');
            return;
        }

        if (endTime.isBefore(startTime)) {
            setError('End time must be after start time');
            return;
        }

        const result = await window.taskAPI.addScheduleEntry({
            taskId,
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

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Schedule Entry</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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

                    {error && (
                        <Box sx={{ color: 'error.main', mt: 1 }}>
                            {error}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleAdd} variant="contained">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}
