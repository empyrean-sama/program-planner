import React from 'react';
import {
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Chip,
    Box,
    Tooltip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Task } from '../../../types/Task';
import dayjs from 'dayjs';
import { getTaskCardAppearance, getWarningMessages } from '../../../services/TaskCardRulesEngine';
import { transitions } from '../../../utils/animations';

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
    // Get appearance from rules engine
    const appearance = getTaskCardAppearance(task);
    const warningMessages = getWarningMessages(appearance.warnings);
    const isRemoved = task.state === 'Removed';

    return (
        <Card 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                breakInside: 'avoid', // Prevent breaking in masonry layout
                ...transitions.hover,
                ...appearance.styles.backgroundColor && { backgroundColor: appearance.styles.backgroundColor },
                ...appearance.styles.backgroundImage && { backgroundImage: appearance.styles.backgroundImage },
                ...appearance.styles.opacity && { opacity: appearance.styles.opacity },
                ...appearance.styles.borderColor && {
                    border: `${appearance.styles.borderWidth}px ${appearance.styles.borderStyle} ${appearance.styles.borderColor}`,
                },
            }}
        >
            <CardActionArea 
                onClick={() => onClick(task)} 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                }}
            >
                <CardContent sx={{ width: '100%' }}>
                    {/* Title and State */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                flex: 1,
                                ...(isRemoved && { textDecoration: 'line-through' }),
                            }}
                        >
                            {task.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            {appearance.showWarningIcon && (
                                <Tooltip title={
                                    <Box>
                                        {warningMessages.map((msg, idx) => (
                                            <Typography key={idx} variant="caption" display="block">
                                                • {msg}
                                            </Typography>
                                        ))}
                                    </Box>
                                } arrow>
                                    <WarningAmberIcon 
                                        color={appearance.warningIconColor}
                                        sx={{ fontSize: 20 }}
                                    />
                                </Tooltip>
                            )}
                            
                            <Chip
                                label={task.state}
                                color={appearance.chipColor}
                                size="small"
                            />
                        </Box>
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
                            minHeight: '2.5em',
                            ...(isRemoved && { textDecoration: 'line-through' }),
                        }}
                    >
                        {task.description}
                    </Typography>

                    {/* Progress Bar for Scheduled/Doing tasks with estimates */}
                    {appearance.metrics.hasEstimate && appearance.metrics.hasSchedule && 
                     ['Scheduled', 'Doing'].includes(task.state) && (
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Progress
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {task.elapsedTime}m / {task.estimatedTime}m 
                                    ({Math.round(appearance.metrics.progressPercentage)}%)
                                </Typography>
                            </Box>
                            <Box 
                                sx={{ 
                                    width: '100%', 
                                    height: 6, 
                                    bgcolor: 'rgba(0,0,0,0.1)', 
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        width: `${Math.min(100, appearance.metrics.progressPercentage)}%`,
                                        height: '100%',
                                        bgcolor: appearance.metrics.exceedsEstimate 
                                            ? 'error.main' 
                                            : appearance.metrics.progressPercentage > 80 
                                                ? 'warning.main' 
                                                : 'success.main',
                                        transition: 'width 0.3s ease',
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Points Badge */}
                    {task.points > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Chip
                                label={`${task.points} pts`}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{
                                    ...(isRemoved && { textDecoration: 'line-through' }),
                                }}
                            />
                        </Box>
                    )}

                    {/* Due Date and Time Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {task.dueDateTime && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventIcon 
                                    sx={{ 
                                        fontSize: 16, 
                                        color: appearance.warnings.overdue ? 'error.main' : 'text.secondary',
                                    }} 
                                />
                                <Typography 
                                    variant="caption" 
                                    sx={{
                                        color: appearance.warnings.overdue ? 'error.main' : 'text.secondary',
                                        fontWeight: appearance.warnings.overdue ? 600 : 400,
                                        ...(isRemoved && { textDecoration: 'line-through' }),
                                    }}
                                >
                                    Due: {dayjs(task.dueDateTime).format('MMM D, YYYY h:mm A')}
                                </Typography>
                            </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {task.estimatedTime && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{
                                            ...(isRemoved && { textDecoration: 'line-through' }),
                                        }}
                                    >
                                        Est: {task.estimatedTime}m
                                    </Typography>
                                </Box>
                            )}
                            
                            {task.elapsedTime > 0 && (
                                <Typography 
                                    variant="caption" 
                                    sx={{
                                        color: appearance.metrics.exceedsEstimate ? 'error.main' : 'text.secondary',
                                        fontWeight: appearance.metrics.exceedsEstimate ? 600 : 400,
                                        ...(isRemoved && { textDecoration: 'line-through' }),
                                    }}
                                >
                                    • Elapsed: {task.elapsedTime}m
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Warning Messages */}
                    {warningMessages.length > 0 && !isRemoved && (
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                            {warningMessages.map((message, idx) => (
                                <Typography 
                                    key={idx}
                                    variant="caption" 
                                    color={(appearance.warnings.overdue || appearance.warnings.scheduleBeyondDueDate) ? 'error.main' : 'warning.main'}
                                    sx={{ display: 'block', fontWeight: 500 }}
                                >
                                    ⚠ {message}
                                </Typography>
                            ))}
                        </Box>
                    )}
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
            columns: {
                xs: '1 auto',
                sm: '2 300px',
                md: '3 300px',
                lg: '4 300px',
            },
            columnGap: 2,
            '& > *': {
                marginBottom: 2,
                display: 'inline-block',
                width: '100%',
            }
        }}>
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
        </Box>
    );
}
