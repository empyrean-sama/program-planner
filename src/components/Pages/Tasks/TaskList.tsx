import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Chip,
    Box,
    Typography,
} from '@mui/material';
import { Task } from '../../../types/Task';
import dayjs from 'dayjs';

interface TaskListProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export default function TaskList({ tasks, onTaskClick }: TaskListProps) {
    const getStateColor = (state: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
        switch (state) {
            case 'Filed': return 'default';
            case 'Scheduled': return 'info';
            case 'Doing': return 'primary';
            case 'Finished': return 'success';
            case 'Failed': return 'error';
            case 'Deferred': return 'warning';
            case 'Removed': return 'default';
            default: return 'default';
        }
    };

    if (tasks.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                    No tasks found
                </Typography>
            </Box>
        );
    }

    return (
        <List sx={{ width: '100%' }}>
            {tasks.map((task) => (
                <Paper key={task.id} sx={{ mb: 1 }}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => onTaskClick(task)}>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6">{task.title}</Typography>
                                        <Chip
                                            label={task.state}
                                            color={getStateColor(task.state)}
                                            size="small"
                                        />
                                        {task.points > 0 && (
                                            <Chip
                                                label={`${task.points} pts`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Box component="span" sx={{ display: 'block', mt: 1 }}>
                                        <Typography component="span" variant="body2" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                            {task.description}
                                        </Typography>
                                        <Box component="span" sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                            {task.dueDateTime && (
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    Due: {dayjs(task.dueDateTime).format('MMM D, YYYY h:mm A')}
                                                </Typography>
                                            )}
                                            {task.estimatedTime && (
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    Est: {task.estimatedTime} mins
                                                </Typography>
                                            )}
                                            {task.elapsedTime > 0 && (
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    Elapsed: {task.elapsedTime} mins
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                }
                                primaryTypographyProps={{ component: 'div' }}
                                secondaryTypographyProps={{ component: 'div' }}
                            />
                        </ListItemButton>
                    </ListItem>
                </Paper>
            ))}
        </List>
    );
}
