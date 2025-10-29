import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    InputAdornment,
} from '@mui/material';
import { Task } from '../../../types/Task';
import useAppGlobalState from '../../../hooks/useAppGlobalState';

interface CreateTaskFromStoryDialogProps {
    storyId: string;
    open: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
}

export default function CreateTaskFromStoryDialog({
    storyId,
    open,
    onClose,
    onTaskCreated,
}: CreateTaskFromStoryDialogProps) {
    const { showToast } = useAppGlobalState();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [dueDateTime, setDueDateTime] = useState('');

    const handleCreate = async () => {
        if (!title.trim()) {
            showToast('Task title is required', 'error');
            return;
        }

        try {
            const result = await window.taskAPI.createTask({
                title,
                description,
                estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : undefined,
                dueDateTime: dueDateTime || undefined,
                storyIds: [storyId], // Auto-assign to current story
            });

            if (result.success) {
                showToast('Task created successfully', 'success');
                handleClose();
                onTaskCreated();
            } else {
                showToast(result.error || 'Failed to create task', 'error');
            }
        } catch (error) {
            showToast('An error occurred while creating task', 'error');
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setEstimatedTime('');
        setDueDateTime('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create Task in Story</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Title"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        required
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        label="Estimated Time"
                        type="number"
                        fullWidth
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                        }}
                        helperText="Points will be calculated automatically based on estimated time"
                    />
                    <TextField
                        label="Due Date & Time"
                        type="datetime-local"
                        fullWidth
                        value={dueDateTime}
                        onChange={(e) => setDueDateTime(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
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
