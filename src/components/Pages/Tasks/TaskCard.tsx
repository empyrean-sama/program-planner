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
import { TasksEmptyState } from '../../Common/EmptyState';

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
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

                    {/* Description - Only show if task has no schedule or estimate (Filed tasks) */}
                    {!appearance.metrics.hasSchedule && !appearance.metrics.hasEstimate && task.description && (
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
                    )}

                    {/* Progress Bar for Scheduled/Doing tasks with estimates - Compact version */}
                    {appearance.metrics.hasEstimate && appearance.metrics.hasSchedule && 
                     ['Scheduled', 'Doing'].includes(task.state) && (
                        <Box sx={{ mb: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Progress
                                </Typography>
                                <Typography variant="caption" fontWeight={600} sx={{
                                    color: appearance.metrics.exceedsEstimate 
                                        ? 'error.main' 
                                        : appearance.metrics.progressPercentage > 80 
                                            ? 'warning.main' 
                                            : 'success.main'
                                }}>
                                    {Math.round(appearance.metrics.progressPercentage)}%
                                </Typography>
                            </Box>
                            <Box 
                                sx={{ 
                                    width: '100%', 
                                    height: 4, 
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

                    {/* Points Badge - Only show for high-value tasks (8+ points) or when no other metrics */}
                    {task.points >= 8 && (
                        <Box sx={{ mb: 1 }}>
                            <Chip
                                label={`${task.points} pts`}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    ...(isRemoved && { textDecoration: 'line-through' }),
                                }}
                            />
                        </Box>
                    )}

                    {/* Due Date and Time Info - Compact */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {/* Most important: Due date (always show if exists) */}
                        {task.dueDateTime && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventIcon 
                                    sx={{ 
                                        fontSize: 14, 
                                        color: appearance.warnings.overdue ? 'error.main' : 'text.secondary',
                                    }} 
                                />
                                <Typography 
                                    variant="caption" 
                                    sx={{
                                        color: appearance.warnings.overdue ? 'error.main' : 'text.secondary',
                                        fontWeight: appearance.warnings.overdue ? 600 : 400,
                                        fontSize: '0.7rem',
                                        ...(isRemoved && { textDecoration: 'line-through' }),
                                    }}
                                >
                                    {dayjs(task.dueDateTime).format('MMM D, h:mm A')}
                                </Typography>
                            </Box>
                        )}
                        
                        {/* Compact time metrics - only show estimate for Filed tasks, or if exceeded */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {task.estimatedTime && (!appearance.metrics.hasSchedule || task.state === 'Filed') && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{
                                            fontSize: '0.7rem',
                                            ...(isRemoved && { textDecoration: 'line-through' }),
                                        }}
                                    >
                                        {task.estimatedTime}m
                                    </Typography>
                                </Box>
                            )}
                            
                            {/* Only show elapsed time if it exceeds estimate (warning state) */}
                            {appearance.metrics.exceedsEstimate && task.elapsedTime > 0 && (
                                <Typography 
                                    variant="caption" 
                                    sx={{
                                        color: 'error.main',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        ...(isRemoved && { textDecoration: 'line-through' }),
                                    }}
                                >
                                    ⚠ {task.elapsedTime}m used
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Warning Messages - Only show critical warnings (overdue, schedule violations) */}
                    {!isRemoved && (appearance.warnings.overdue || appearance.warnings.scheduleBeyondDueDate) && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                            {appearance.warnings.overdue && (
                                <Typography 
                                    variant="caption" 
                                    color="error.main"
                                    sx={{ display: 'block', fontWeight: 600, fontSize: '0.7rem' }}
                                >
                                    ⚠ Overdue
                                </Typography>
                            )}
                            {appearance.warnings.scheduleBeyondDueDate && (
                                <Typography 
                                    variant="caption" 
                                    color="error.main"
                                    sx={{ display: 'block', fontWeight: 600, fontSize: '0.7rem' }}
                                >
                                    ⚠ Scheduled past deadline
                                </Typography>
                            )}
                        </Box>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

// Memoize TaskCard to prevent re-renders when props don't change
const MemoizedTaskCard = React.memo(TaskCard, (prevProps, nextProps) => {
    // Deep comparison of task object
    return (
        prevProps.task.id === nextProps.task.id &&
        prevProps.task.title === nextProps.task.title &&
        prevProps.task.state === nextProps.task.state &&
        prevProps.task.estimatedTime === nextProps.task.estimatedTime &&
        prevProps.task.elapsedTime === nextProps.task.elapsedTime &&
        prevProps.task.dueDateTime === nextProps.task.dueDateTime &&
        prevProps.onClick === nextProps.onClick
    );
});

export default MemoizedTaskCard;

interface TaskCardGridProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function TaskCardGrid({ tasks, onTaskClick }: TaskCardGridProps) {
    if (tasks.length === 0) {
        return <TasksEmptyState />;
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
