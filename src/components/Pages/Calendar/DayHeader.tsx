import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Tooltip, Chip } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useLocation } from 'react-router';
import { Task } from '../../../types/Task';
import {
    getTaskSchedulesForDate,
    getTaskColor,
} from './utils/calendarTaskUtils';

interface DayHeaderProps {
    day: Dayjs;
    onDoubleClick?: (day: Dayjs) => void;
    onClick?: (day: Dayjs) => void;
    isSelected?: boolean;
    currentView?: 'month' | 'week' | 'day';
    currentDate?: Dayjs;
}

export default function DayHeader({ day, onDoubleClick, onClick, isSelected = false, currentView, currentDate }: DayHeaderProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isToday = day.isSame(dayjs(), 'day');
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        const result = await window.taskAPI.getAllTasks();
        if (result.success && result.data) {
            setTasks(result.data);
        }
    };

    const scheduledTasks = getTaskSchedulesForDate(tasks, day)
        // Get unique tasks (a task might have multiple schedule entries for the day)
        .reduce((unique: Task[], event) => {
            if (!unique.find(t => t.id === event.task.id)) {
                unique.push(event.task);
            }
            return unique;
        }, []);

    const handleClick = () => {
        onClick?.(day);
    };

    const handleTaskClick = (taskId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        navigate(`/tasks/${taskId}`, {
            state: {
                from: location.pathname,
                calendarView: currentView,
                calendarDate: currentDate?.format('YYYY-MM-DD'),
            },
        });
    };

    return (
        <Box
            onClick={handleClick}
            onDoubleClick={() => onDoubleClick?.(day)}
            sx={{
                flex: 1,
                textAlign: 'center',
                py: 1,
                mx: 0.5,
                backgroundColor: isToday
                    ? theme.palette.primary.main
                    : theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                cursor: onDoubleClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                position: 'relative',
                outline: isSelected ? `3px solid ${theme.palette.primary.main}` : 'none',
                outlineOffset: '-3px',
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    color: isToday
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.secondary,
                    display: 'block',
                }}
            >
                {day.format('ddd')}
            </Typography>
            <Typography
                variant="h6"
                sx={{
                    color: isToday
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                }}
            >
                {day.format('D')}
            </Typography>

            {/* Task boxes */}
            {scheduledTasks.length > 0 && (
                <Box
                    sx={{
                        mt: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        px: 0.5,
                        maxHeight: '120px',
                        overflow: 'auto',
                    }}
                >
                    {scheduledTasks.map((task) => {
                        const taskColor = getTaskColor(task.state);
                        return (
                            <Tooltip
                                key={task.id}
                                title={
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {task.title}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            State: {task.state}
                                        </Typography>
                                        {task.estimatedTime && (
                                            <Typography variant="caption" display="block">
                                                Est: {task.estimatedTime} min
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                arrow
                            >
                                <Chip
                                    label={task.title}
                                    size="small"
                                    onClick={(e) => handleTaskClick(task.id, e)}
                                    sx={{
                                        backgroundColor: taskColor,
                                        color: '#fff',
                                        fontSize: '0.6rem',
                                        height: '20px',
                                        '& .MuiChip-label': {
                                            px: 0.5,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        },
                                        cursor: 'pointer',
                                        '&:hover': {
                                            opacity: 0.8,
                                        },
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}
