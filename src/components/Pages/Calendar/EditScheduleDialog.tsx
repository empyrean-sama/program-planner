import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    Stack,
    InputAdornment,
} from '@mui/material';
import {
    Close as CloseIcon,
    AccessTime as TimeIcon,
    TrendingFlat as ArrowIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTheme, alpha } from '@mui/material/styles';

dayjs.extend(duration);

interface EditScheduleDialogProps {
    open: boolean;
    taskId: string | null;
    entryId: string | null;
    initialStartTime: Dayjs | null;
    initialEndTime: Dayjs | null;
    onClose: () => void;
    onEntryUpdated: () => void;
}

export default function EditScheduleDialog({
    open,
    taskId,
    entryId,
    initialStartTime,
    initialEndTime,
    onClose,
    onEntryUpdated,
}: EditScheduleDialogProps) {
    const theme = useTheme();
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && initialStartTime && initialEndTime) {
            setStartTime(initialStartTime);
            setEndTime(initialEndTime);
        }
    }, [open, initialStartTime, initialEndTime]);

    const handleClose = () => {
        setStartTime(null);
        setEndTime(null);
        setError('');
        onClose();
    };

    const handleUpdate = async () => {
        if (!taskId || !entryId) {
            setError('Invalid task or entry');
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

        const result = await window.taskAPI.updateScheduleEntry({
            taskId,
            entryId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        });

        if (result.success) {
            handleClose();
            onEntryUpdated();
        } else {
            setError(result.error || 'Failed to update schedule entry');
        }
    };

    // Calculate duration
    const durationMinutes = startTime && endTime && endTime.isAfter(startTime)
        ? endTime.diff(startTime, 'minute')
        : 0;

    const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        minWidth: 0,
                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        bgcolor: 'background.paper',
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: 3,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Edit Schedule Time
                    </Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <DialogContent sx={{ px: 3, py: 3 }}>
                    <Stack spacing={3}>
                        {/* Time Range Control */}
                        <Box>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    mb: 2,
                                    display: 'block',
                                }}
                            >
                                Time Range
                            </Typography>
                            
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {/* Start Time */}
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <DateTimePicker
                                        label="Start Time"
                                        value={startTime}
                                        onChange={(newValue) => {
                                            setStartTime(newValue);
                                            setError('');
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: 'small',
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <TimeIcon fontSize="small" color="action" />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                {/* Arrow Separator */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'text.secondary',
                                    }}
                                >
                                    <ArrowIcon />
                                </Box>

                                {/* End Time */}
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <DateTimePicker
                                        label="End Time"
                                        value={endTime}
                                        onChange={(newValue) => {
                                            setEndTime(newValue);
                                            setError('');
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: 'small',
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <TimeIcon fontSize="small" color="action" />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Duration Display */}
                            {durationMinutes > 0 && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 1.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: alpha(theme.palette.primary.main, 0.1),
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Duration: <strong>{formatDuration(durationMinutes)}</strong>
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Error Message */}
                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Button onClick={handleClose} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleUpdate} 
                        variant="contained"
                        disabled={!startTime || !endTime || !!error}
                    >
                        Update Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
