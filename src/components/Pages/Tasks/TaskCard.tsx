import React from 'react';
import {
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Chip,
    Box,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import { Task } from '../../../types/Task';
import dayjs from 'dayjs';

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
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

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea onClick={() => onClick(task)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardContent sx={{ flex: 1, width: '100%' }}>
                    {/* Title and State */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>
                            {task.title}
                        </Typography>
                        <Chip
                            label={task.state}
                            color={getStateColor(task.state)}
                            size="small"
                        />
                    </Box>

                    {/* Description */}
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minHeight: '2.5em'
                        }}
                    >
                        {task.description}
                    </Typography>

                    {/* Points Badge */}
                    {task.points > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Chip
                                label={`${task.points} pts`}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        </Box>
                    )}

                    {/* Due Date and Time Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {task.dueDateTime && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    Due: {dayjs(task.dueDateTime).format('MMM D, YYYY h:mm A')}
                                </Typography>
                            </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {task.estimatedTime && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        Est: {task.estimatedTime}m
                                    </Typography>
                                </Box>
                            )}
                            
                            {task.elapsedTime > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    • Elapsed: {task.elapsedTime}m
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

interface TaskCardGridProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function TaskCardGrid({ tasks, onTaskClick }: TaskCardGridProps) {
    if (tasks.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
                <Typography variant="h6" color="text.secondary">
                    No tasks found
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
            },
            gap: 2,
        }}>
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
        </Box>
    );
}
