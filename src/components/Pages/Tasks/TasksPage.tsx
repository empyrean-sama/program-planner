import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router';
import { Task } from '../../../types/Task';
import { TaskCardGrid } from './TaskCard';
import TaskDialog from './TaskDialog';
import TaskFilterBar, { TaskFilters } from './TaskFilterBar';
import { filterAndSortTasks } from '../../../utils/taskFiltering';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
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

    const loadTasks = async () => {
        const result = await window.taskAPI.getAllTasks();
        if (result.success && result.data) {
            setTasks(result.data);
        }
    };

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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Tasks</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateTask}
                >
                    New Task
                </Button>
            </Box>

            {/* Filter Bar */}
            <TaskFilterBar
                filters={filters}
                onChange={setFilters}
                taskCount={tasks.length}
                filteredCount={filteredTasks.length}
            />

            {/* Task Grid */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                <TaskCardGrid tasks={filteredTasks} onTaskClick={handleTaskClick} />
            </Box>

            <TaskDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onTaskCreated={handleTaskCreated}
            />
        </Box>
    );
}
