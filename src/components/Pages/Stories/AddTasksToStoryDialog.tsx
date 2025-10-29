import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    Checkbox,
    Typography,
    Chip,
    CircularProgress,
    FormControlLabel,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Task, TaskState } from '../../../types/Task';
import useAppGlobalState from '../../../hooks/useAppGlobalState';

interface AddTasksToStoryDialogProps {
    storyId: string;
    existingTaskIds: string[];
    open: boolean;
    onClose: () => void;
    onTasksAdded: () => void;
}

export default function AddTasksToStoryDialog({
    storyId,
    existingTaskIds,
    open,
    onClose,
    onTasksAdded,
}: AddTasksToStoryDialogProps) {
    const { showToast } = useAppGlobalState();
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [stateFilter, setStateFilter] = useState<TaskState | 'all'>('all');
    const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(true);

    useEffect(() => {
        if (open) {
            loadTasks();
            setSelectedTaskIds([]);
            setSearchQuery('');
        }
    }, [open]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const result = await window.taskAPI.getAllTasks();
            if (result.success && result.data) {
                setAllTasks(result.data);
            } else {
                showToast(result.error || 'Failed to load tasks', 'error');
            }
        } catch (error) {
            showToast('An error occurred while loading tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTasks = async () => {
        if (selectedTaskIds.length === 0) {
            showToast('Please select at least one task', 'error');
            return;
        }

        try {
            const promises = selectedTaskIds.map((taskId) =>
                window.storyAPI.addTask({ storyId, taskId })
            );

            const results = await Promise.all(promises);
            const failedCount = results.filter((r) => !r.success).length;

            if (failedCount === 0) {
                showToast(`${selectedTaskIds.length} task(s) added successfully`, 'success');
                onTasksAdded();
                onClose();
            } else {
                showToast(`${failedCount} task(s) failed to add`, 'error');
            }
        } catch (error) {
            showToast('An error occurred while adding tasks', 'error');
        }
    };

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTaskIds((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };

    const getTaskStateColor = (state: TaskState): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
        switch (state) {
            case 'Doing': return 'primary';
            case 'Finished': return 'success';
            case 'Failed': return 'error';
            case 'Deferred': return 'warning';
            default: return 'default';
        }
    };

    // Filter tasks
    const filteredTasks = allTasks.filter((task) => {
        // Exclude tasks already in the story
        if (existingTaskIds.includes(task.id)) return false;

        // Show only unassigned tasks
        if (showOnlyUnassigned && task.storyId) return false;

        // State filter
        if (stateFilter !== 'all' && task.state !== stateFilter) return false;

        // Search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            );
        }

        return true;
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Add Tasks to Story</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* Search and Filters */}
                    <TextField
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showOnlyUnassigned}
                                    onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
                                />
                            }
                            label="Only unassigned tasks"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label="All"
                            onClick={() => setStateFilter('all')}
                            color={stateFilter === 'all' ? 'primary' : 'default'}
                            variant={stateFilter === 'all' ? 'filled' : 'outlined'}
                        />
                        {(['Filed', 'Scheduled', 'Doing', 'Finished', 'Failed', 'Deferred'] as TaskState[]).map(
                            (state) => (
                                <Chip
                                    key={state}
                                    label={state}
                                    onClick={() => setStateFilter(state)}
                                    color={stateFilter === state ? getTaskStateColor(state) : 'default'}
                                    variant={stateFilter === state ? 'filled' : 'outlined'}
                                />
                            )
                        )}
                    </Box>

                    {/* Task List */}
                    <Box
                        sx={{
                            maxHeight: 400,
                            overflowY: 'auto',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 1,
                        }}
                    >
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : filteredTasks.length === 0 ? (
                            <Box sx={{ textAlign: 'center', p: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No tasks found
                                </Typography>
                            </Box>
                        ) : (
                            filteredTasks.map((task) => (
                                <Box
                                    key={task.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        p: 1.5,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                        bgcolor: selectedTaskIds.includes(task.id)
                                            ? 'action.selected'
                                            : 'transparent',
                                    }}
                                    onClick={() => toggleTaskSelection(task.id)}
                                >
                                    <Checkbox
                                        checked={selectedTaskIds.includes(task.id)}
                                        onChange={() => toggleTaskSelection(task.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {task.title}
                                            </Typography>
                                            <Chip
                                                label={task.state}
                                                size="small"
                                                color={getTaskStateColor(task.state)}
                                            />
                                            <Chip label={`${task.points} pts`} size="small" variant="outlined" />
                                        </Box>
                                        {task.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {task.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>

                    {selectedTaskIds.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {selectedTaskIds.length} task(s) selected
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleAddTasks} variant="contained" disabled={selectedTaskIds.length === 0}>
                    Add {selectedTaskIds.length > 0 ? `(${selectedTaskIds.length})` : ''}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
