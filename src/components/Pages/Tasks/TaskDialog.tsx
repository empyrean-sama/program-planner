import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Checkbox,
    ListItemText,
    Typography,
    Divider,
    IconButton,
    Stack,
    alpha,
} from '@mui/material';
import {
    Close as CloseIcon,
    Schedule as ScheduleIcon,
    Timer as TimerIcon,
    LibraryBooks as StoriesIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { CreateTaskInput } from '../../../types/Task';
import { Story } from '../../../types/Story';
import MarkdownTextarea from '../../Common/MarkdownTextarea';
import { useTheme } from '@mui/material/styles';

interface TaskDialogProps {
    open: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
}

export default function TaskDialog({ open, onClose, onTaskCreated }: TaskDialogProps) {
    const theme = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDateTime, setDueDateTime] = useState<Dayjs | null>(null);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [selectedStories, setSelectedStories] = useState<string[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (open) {
            loadStories();
        }
    }, [open]);

    const loadStories = async () => {
        try {
            const result = await window.storyAPI.getAllStories();
            if (result.success && result.data) {
                // Only show Filed and Running stories
                setStories(result.data.filter(s => s.state !== 'Finished'));
            }
        } catch (error) {
            console.error('Failed to load stories', error);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setDueDateTime(null);
        setEstimatedTime('');
        setSelectedStories([]);
        setErrors({});
        onClose();
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (estimatedTime && (isNaN(Number(estimatedTime)) || Number(estimatedTime) <= 0)) {
            newErrors.estimatedTime = 'Estimated time must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = async () => {
        if (!validate()) {
            return;
        }

        const input: CreateTaskInput = {
            title: title.trim(),
            description: description.trim(),
            dueDateTime: dueDateTime?.toISOString(),
            estimatedTime: estimatedTime ? Number(estimatedTime) : undefined,
            storyIds: selectedStories.length > 0 ? selectedStories : undefined,
        };

        const result = await window.taskAPI.createTask(input);
        if (result.success) {
            handleClose();
            onTaskCreated();
        } else {
            setErrors({ general: result.error || 'Failed to create task' });
        }
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
            {/* Custom Header with Close Button */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ p: 2, pb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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

                    {/* Task Title as Main Header */}
                    <TextField
                        fullWidth
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        error={!!errors.title}
                        helperText={errors.title}
                        placeholder="Task title..."
                        variant="standard"
                        InputProps={{
                            disableUnderline: false,
                            sx: {
                                fontSize: '1.75rem',
                                fontWeight: 600,
                                '& input': {
                                    py: 0.5,
                                },
                                '& input::placeholder': {
                                    opacity: 0.5,
                                    fontWeight: 500,
                                },
                            },
                        }}
                        sx={{
                            '& .MuiInput-root:before': {
                                borderBottomColor: alpha(theme.palette.divider, 0.5),
                            },
                            '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                                borderBottomColor: theme.palette.primary.main,
                            },
                        }}
                    />
                </Box>
            </Box>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Stack spacing={3}>
                    {/* Description Section */}
                    <Box>
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                mb: 1.5, 
                                fontWeight: 600,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: 0.5,
                            }}
                        >
                            Description
                        </Typography>
                        <MarkdownTextarea
                            label=""
                            value={description}
                            onChange={setDescription}
                            rows={6}
                            placeholder="Enter task description... Supports markdown formatting"
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </Box>

                    <Divider />

                    {/* Metadata Section */}
                    <Box>
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                mb: 2, 
                                fontWeight: 600,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: 0.5,
                            }}
                        >
                            Details
                        </Typography>

                        <Stack spacing={2.5}>
                            {/* Due Date */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <ScheduleIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                        Due Date
                                    </Typography>
                                </Box>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        value={dueDateTime}
                                        onChange={(newValue) => setDueDateTime(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: 'small',
                                                placeholder: 'No deadline set',
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            {/* Estimated Time */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TimerIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                        Estimated Time
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={estimatedTime}
                                    onChange={(e) => setEstimatedTime(e.target.value)}
                                    error={!!errors.estimatedTime}
                                    helperText={errors.estimatedTime || 'In minutes (cannot be changed later)'}
                                    placeholder="e.g., 60"
                                    InputProps={{ inputProps: { min: 0 } }}
                                />
                            </Box>

                            {/* Stories */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <StoriesIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                        Stories
                                    </Typography>
                                </Box>
                                <FormControl fullWidth size="small">
                                    <Select
                                        multiple
                                        value={selectedStories}
                                        onChange={(e) => setSelectedStories(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (selected.length === 0) {
                                                return <Typography sx={{ color: 'text.disabled' }}>No stories selected</Typography>;
                                            }
                                            return (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => {
                                                        const story = stories.find(s => s.id === value);
                                                        return story ? (
                                                            <Chip 
                                                                key={value} 
                                                                label={story.title} 
                                                                size="small"
                                                                sx={{ 
                                                                    height: 24,
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            />
                                                        ) : null;
                                                    })}
                                                </Box>
                                            );
                                        }}
                                    >
                                        {stories.length === 0 ? (
                                            <MenuItem disabled>
                                                <Typography variant="body2" color="text.secondary">
                                                    No active stories available
                                                </Typography>
                                            </MenuItem>
                                        ) : (
                                            stories.map((story) => (
                                                <MenuItem key={story.id} value={story.id}>
                                                    <Checkbox 
                                                        checked={selectedStories.indexOf(story.id) > -1}
                                                        size="small"
                                                    />
                                                    <ListItemText 
                                                        primary={story.title}
                                                        secondary={story.state}
                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                        secondaryTypographyProps={{ variant: 'caption' }}
                                                    />
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Stack>
                    </Box>

                    {errors.general && (
                        <Box 
                            sx={{ 
                                p: 1.5, 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                borderRadius: 1,
                                border: 1,
                                borderColor: alpha(theme.palette.error.main, 0.3),
                            }}
                        >
                            <Typography variant="body2" color="error">
                                {errors.general}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions 
                sx={{ 
                    px: 3, 
                    py: 2, 
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderTop: 1,
                    borderColor: 'divider',
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
                    onClick={handleCreate} 
                    variant="contained"
                    sx={{ 
                        minWidth: 100,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 2,
                    }}
                >
                    Create Task
                </Button>
            </DialogActions>
        </Dialog>
    );
}
