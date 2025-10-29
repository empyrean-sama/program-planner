import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { CreateTaskInput } from '../../../types/Task';
import { Story } from '../../../types/Story';
import MarkdownTextarea from '../../Common/MarkdownTextarea';

interface TaskDialogProps {
    open: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
}

export default function TaskDialog({ open, onClose, onTaskCreated }: TaskDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDateTime, setDueDateTime] = useState<Dayjs | null>(null);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [storyId, setStoryId] = useState('');
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
        setStoryId('');
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
            storyId: storyId || undefined,
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
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Title"
                        fullWidth
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        error={!!errors.title}
                        helperText={errors.title}
                    />

                    <MarkdownTextarea
                        label="Description"
                        value={description}
                        onChange={setDescription}
                        rows={6}
                        placeholder="Enter task description... Supports markdown formatting"
                        error={!!errors.description}
                        helperText={errors.description}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Due Date & Time (Optional)"
                            value={dueDateTime}
                            onChange={(newValue) => setDueDateTime(newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                }
                            }}
                        />
                    </LocalizationProvider>

                    <TextField
                        label="Estimated Time (minutes)"
                        fullWidth
                        type="number"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        error={!!errors.estimatedTime}
                        helperText={errors.estimatedTime || 'This cannot be changed after creation'}
                        InputProps={{ inputProps: { min: 0 } }}
                    />

                    <FormControl fullWidth>
                        <InputLabel>Story (Optional)</InputLabel>
                        <Select
                            value={storyId}
                            label="Story (Optional)"
                            onChange={(e) => setStoryId(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {stories.map((story) => (
                                <MenuItem key={story.id} value={story.id}>
                                    {story.title} ({story.state})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {errors.general && (
                        <Box sx={{ color: 'error.main', mt: 1 }}>
                            {errors.general}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleCreate} variant="contained">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
