import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Button,
    Typography,
    Fade,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router';
import { Task } from '../../../types/Task';
import { TaskCardGrid } from './TaskCard';
import TaskDialog from './TaskDialog';
import TaskFilterBar, { TaskFilters } from './TaskFilterBar';
import { filterAndSortTasks } from '../../../utils/taskFiltering';
import { TaskCardGridSkeleton } from '../../Common/LoadingSkeletons';
import { ErrorBoundary } from '../../Common/ErrorBoundary';
import { transitions } from '../../../utils/animations';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const navigate = useNavigate();
    
    // Filter state
    const [filters, setFilters] = useState<TaskFilters>({
        searchText: '',
        states: [],
        sortBy: 'filingDate-desc',
        dateRangeStart: null,
        dateRangeEnd: null,
        dateRangeField: 'filing',
        hasDeadline: undefined,
        hasSchedule: undefined,
        hasComments: undefined,
        minPoints: undefined,
        maxPoints: undefined,
    });

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            const result = await window.taskAPI.getAllTasks();
            if (result.success && result.data) {
                setTasks(result.data);
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreateTask = () => {
        setCreateDialogOpen(true);
    };

    const handleTaskCreated = () => {
        setCreateDialogOpen(false);
        loadTasks();
    };

    const handleTaskClick = (task: Task) => {
        navigate(`/tasks/${task.id}`);
    };

    // Memoized filtered and sorted tasks for performance
    const filteredTasks = useMemo(() => {
        return filterAndSortTasks(tasks, filters);
    }, [tasks, filters]);

    return (
        <ErrorBoundary>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                <Fade in timeout={300}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" sx={transitions.fadeInDown}>
                            Tasks
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateTask}
                            sx={transitions.hoverScale}
                        >
                            New Task
                        </Button>
                    </Box>
                </Fade>

                {/* Filter Bar */}
                {!loading && (
                    <Fade in timeout={400}>
                        <Box>
                            <TaskFilterBar
                                filters={filters}
                                onChange={setFilters}
                                taskCount={tasks.length}
                                filteredCount={filteredTasks.length}
                            />
                        </Box>
                    </Fade>
                )}

                {/* Task Grid */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {loading ? (
                        <TaskCardGridSkeleton count={8} />
                    ) : (
                        <Fade in timeout={500}>
                            <Box>
                                <TaskCardGrid tasks={filteredTasks} onTaskClick={handleTaskClick} />
                            </Box>
                        </Fade>
                    )}
                </Box>

                <TaskDialog
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    onTaskCreated={handleTaskCreated}
                />
            </Box>
        </ErrorBoundary>
    );
}
