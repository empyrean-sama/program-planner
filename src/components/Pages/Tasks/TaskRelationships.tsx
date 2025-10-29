import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Task, TaskRelationship } from '../../../types/Task';
import SearchableComboBox from '../../Common/SearchableComboBox';
import TaskDependencyGraph from './TaskDependencyGraph';

interface TaskRelationshipsProps {
    task: Task;
    onUpdate: () => void;
}

export default function TaskRelationships({ task, onUpdate }: TaskRelationshipsProps) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [graphDialogOpen, setGraphDialogOpen] = useState(false);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [relationshipType, setRelationshipType] = useState<'predecessor' | 'successor'>('predecessor');
    const [error, setError] = useState('');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        const result = await window.taskAPI.getAllTasks();
        if (result.success && result.data) {
            // Filter out current task and final state tasks
            const finalStates = ['Removed', 'Finished', 'Deferred', 'Failed'];
            const availableTasks = result.data.filter(
                t => t.id !== task.id && !finalStates.includes(t.state)
            );
            setAllTasks(availableTasks);
        }
    };

    const handleAddRelationship = async () => {
        if (!selectedTaskId) {
            setError('Please select a task');
            return;
        }

        const result = await window.taskAPI.addRelationship({
            taskId: task.id,
            relatedTaskId: selectedTaskId,
            type: relationshipType,
        });

        if (result.success) {
            setAddDialogOpen(false);
            setSelectedTaskId('');
            setError('');
            onUpdate();
        } else {
            setError(result.error || 'Failed to add relationship');
        }
    };

    const handleRemoveRelationship = async (relationshipId: string) => {
        const result = await window.taskAPI.removeRelationship({
            taskId: task.id,
            relationshipId,
        });

        if (result.success) {
            onUpdate();
        }
    };

    const getRelatedTask = (relatedTaskId: string): Task | undefined => {
        return allTasks.find(t => t.id === relatedTaskId);
    };

    const taskOptions = allTasks.map(t => ({
        value: t.id,
        label: t.title,
        subtitle: `${t.state} • ${t.points} pts`,
    }));

    const predecessors = task.relationships.filter(r => r.type === 'predecessor');
    const successors = task.relationships.filter(r => r.type === 'successor');

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Task Relationships</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AccountTreeIcon />}
                        onClick={() => setGraphDialogOpen(true)}
                        sx={{ mr: 1 }}
                        disabled={predecessors.length === 0}
                    >
                        View Graph
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setAddDialogOpen(true)}
                    >
                        Add Relationship
                    </Button>
                </Box>
            </Box>

            {/* Predecessors */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Predecessors (must be completed before this task)
            </Typography>
            {predecessors.length > 0 ? (
                <TableContainer sx={{ mb: 3 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Task</TableCell>
                                <TableCell>State</TableCell>
                                <TableCell>Points</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {predecessors.map(rel => {
                                const relatedTask = getRelatedTask(rel.relatedTaskId);
                                return (
                                    <TableRow key={rel.id}>
                                        <TableCell>{relatedTask?.title || 'Unknown'}</TableCell>
                                        <TableCell>{relatedTask?.state || '-'}</TableCell>
                                        <TableCell>{relatedTask?.points || 0}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveRelationship(rel.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    No predecessors defined
                </Typography>
            )}

            {/* Successors */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Successors (tasks that depend on this one)
            </Typography>
            {successors.length > 0 ? (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Task</TableCell>
                                <TableCell>State</TableCell>
                                <TableCell>Points</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {successors.map(rel => {
                                const relatedTask = getRelatedTask(rel.relatedTaskId);
                                return (
                                    <TableRow key={rel.id}>
                                        <TableCell>{relatedTask?.title || 'Unknown'}</TableCell>
                                        <TableCell>{relatedTask?.state || '-'}</TableCell>
                                        <TableCell>{relatedTask?.points || 0}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveRelationship(rel.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No successors defined
                </Typography>
            )}

            {/* Add Relationship Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Task Relationship</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        
                        <FormControl fullWidth>
                            <InputLabel>Relationship Type</InputLabel>
                            <Select
                                value={relationshipType}
                                label="Relationship Type"
                                onChange={(e) => setRelationshipType(e.target.value as 'predecessor' | 'successor')}
                            >
                                <MenuItem value="predecessor">Predecessor (must complete before this task)</MenuItem>
                                <MenuItem value="successor">Successor (depends on this task)</MenuItem>
                            </Select>
                        </FormControl>

                        <SearchableComboBox
                            label={relationshipType === 'predecessor' ? 'Select Predecessor Task' : 'Select Successor Task'}
                            value={selectedTaskId}
                            options={taskOptions}
                            onChange={setSelectedTaskId}
                            placeholder="Search tasks..."
                            searchThreshold={5}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddRelationship} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Dependency Graph Dialog */}
            <TaskDependencyGraph
                open={graphDialogOpen}
                taskId={task.id}
                onClose={() => setGraphDialogOpen(false)}
            />
        </Box>
    );
}
