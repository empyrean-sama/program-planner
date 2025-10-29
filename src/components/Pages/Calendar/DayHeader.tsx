import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Tooltip, Chip } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Task } from '../../../types/Task';
import {
    getTaskDeadlinesForDate,
    getDeadlineColor,
    getDeadlineUrgency,
} from './utils/calendarTaskUtils';

interface DayHeaderProps {
    day: Dayjs;
    onDoubleClick?: (day: Dayjs) => void;
    onClick?: (day: Dayjs) => void;
    isSelected?: boolean;
    currentView?: 'month' | 'week' | 'day';
    currentDate?: Dayjs;
    onContextMenu?: (event: React.MouseEvent, date: Dayjs, hour?: number, task?: Task, scheduleEntryId?: string) => void;
}

export default function DayHeader({ day, onDoubleClick, onClick, isSelected = false, currentView, currentDate, onContextMenu }: DayHeaderProps) {
    const theme = useTheme();
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

    const deadlines = getTaskDeadlinesForDate(tasks, day);

    const handleClick = () => {
        onClick?.(day);
    };

    const handleDeadlineContextMenu = (event: React.MouseEvent, task: Task) => {
        event.stopPropagation();
        if (onContextMenu) {
            onContextMenu(event, day, undefined, task, '');
        }
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

            {/* Deadline indicators */}
            {deadlines.length > 0 && (
                <Box
                    sx={{
                        mt: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        px: 0.5,
                        maxHeight: '80px',
                        overflow: 'auto',
                    }}
                >
                    {deadlines.map((deadline) => {
                        const urgency = getDeadlineUrgency(deadline.dueDateTime);
                        const deadlineColor = getDeadlineColor(urgency);
                        return (
                            <Tooltip
                                key={deadline.task.id}
                                title={
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: deadlineColor }}>
                                            DEADLINE: {deadline.task.title}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Due: {deadline.dueDateTime.format('h:mm A')}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            State: {deadline.task.state}
                                        </Typography>
                                    </Box>
                                }
                                arrow
                            >
                                <Chip
                                    label={`⚠️ ${deadline.task.title}`}
                                    size="small"
                                    onContextMenu={(e) => handleDeadlineContextMenu(e, deadline.task)}
                                    sx={{
                                        backgroundColor: deadlineColor,
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
