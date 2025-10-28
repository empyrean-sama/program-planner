import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    Tabs,
    Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Task, TaskState } from '../../../types/Task';
import TaskList from './TaskList';
import TaskDialog from './TaskDialog';
import TaskDetailsDialog from './TaskDetailsDialog';

const taskStates: TaskState[] = ['Filed', 'Scheduled', 'Doing', 'Finished', 'Failed', 'Deferred', 'Removed'];

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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
        setSelectedTask(task);
        setDetailsDialogOpen(true);
    };

    const handleTaskUpdated = () => {
        loadTasks();
    };

    const handleTaskDeleted = () => {
        setDetailsDialogOpen(false);
        setSelectedTask(null);
        loadTasks();
    };

    const getFilteredTasks = (): Task[] => {
        if (selectedTab === 0) {
            return tasks; // All tasks
        }
        const state = taskStates[selectedTab - 1];
        return tasks.filter(task => task.state === state);
    };

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

            <Tabs
                value={selectedTab}
                onChange={(_, newValue) => setSelectedTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
                <Tab label={`All (${tasks.length})`} />
                {taskStates.map(state => {
                    const count = tasks.filter(t => t.state === state).length;
                    return <Tab key={state} label={`${state} (${count})`} />;
                })}
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
                <TaskList tasks={getFilteredTasks()} onTaskClick={handleTaskClick} />
            </Box>

            <TaskDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onTaskCreated={handleTaskCreated}
            />

            {selectedTask && (
                <TaskDetailsDialog
                    open={detailsDialogOpen}
                    task={selectedTask}
                    onClose={() => {
                        setDetailsDialogOpen(false);
                        setSelectedTask(null);
                    }}
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                />
            )}
        </Box>
    );
}
