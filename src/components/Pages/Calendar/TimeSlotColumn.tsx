import React, { useState, useEffect } from 'react';
import { Box, useTheme, Tooltip, Typography, Paper } from '@mui/material';
import { Dayjs } from 'dayjs';
import { useNavigate, useLocation } from 'react-router';
import { Task } from '../../../types/Task';
import {
    getTaskSchedulesForDate,
    getTaskDeadlinesForDate,
    calculateEventPosition,
    getTaskColor,
    formatTaskTimeRange,
    getDeadlineUrgency,
    getDeadlineColor,
    TaskCalendarEvent,
    layoutEvents,
} from './utils/calendarTaskUtils';

interface TimeSlotColumnProps {
    hours: number[];
    hourHeight: number;
    showBorderLeft?: boolean;
    day?: Dayjs;
    onContextMenu?: (event: React.MouseEvent, date: Dayjs, hour?: number) => void;
    currentView?: 'month' | 'week' | 'day';
    currentDate?: Dayjs;
}

export default function TimeSlotColumn({ 
    hours, 
    hourHeight,
    showBorderLeft = true,
    day,
    onContextMenu,
    currentView,
    currentDate,
}: TimeSlotColumnProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
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

    const scheduleEvents = day ? getTaskSchedulesForDate(tasks, day) : [];
    const deadlines = day ? getTaskDeadlinesForDate(tasks, day) : [];
    
    // Calculate layout for overlapping events
    const layoutedEvents = layoutEvents(scheduleEvents);

    const handleTaskClick = (taskId: string) => {
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
            sx={{
                flex: 1,
                position: 'relative',
                mx: showBorderLeft ? 0.5 : 0,
                borderLeft: showBorderLeft ? `2px solid ${theme.palette.divider}` : `1px solid ${theme.palette.divider}`,
            }}
        >
            {/* Hour lines */}
            {hours.map((hour) => (
                <Box
                    key={hour}
                    onContextMenu={(e) => day && onContextMenu?.(e, day, hour)}
                    sx={{
                        position: 'absolute',
                        top: `${hour * hourHeight}px`,
                        left: 0,
                        right: 0,
                        height: `${hourHeight}px`,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        },
                    }}
                />
            ))}
            
            {/* Task schedule events */}
            {layoutedEvents.map((event: TaskCalendarEvent, index: number) => {
                const position = calculateEventPosition(event, day!, hourHeight);
                const taskColor = getTaskColor(event.task.state);
                
                // Calculate horizontal position based on column
                const columnWidth = event.totalColumns ? 100 / event.totalColumns : 100;
                const leftPercent = event.column !== undefined ? event.column * columnWidth : 0;

                return (
                    <Tooltip
                        key={`${event.task.id}-${event.scheduleEntry.id}`}
                        title={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {event.task.title}
                                </Typography>
                                <Typography variant="caption">
                                    {formatTaskTimeRange(event.startTime, event.endTime)}
                                </Typography>
                                <Typography variant="caption" display="block">
                                    State: {event.task.state}
                                </Typography>
                            </Box>
                        }
                        arrow
                    >
                        <Paper
                            elevation={2}
                            onClick={() => handleTaskClick(event.task.id)}
                            sx={{
                                position: 'absolute',
                                top: `${position.top}px`,
                                left: `calc(${leftPercent}% + 2px)`,
                                width: `calc(${columnWidth}% - 4px)`,
                                height: `${position.height}px`,
                                backgroundColor: taskColor,
                                color: '#fff',
                                p: 0.5,
                                cursor: 'pointer',
                                overflow: 'hidden',
                                borderTop: position.startsBeforeDay ? '2px dashed #fff' : 'none',
                                borderBottom: position.endsAfterDay ? '2px dashed #fff' : 'none',
                                '&:hover': {
                                    opacity: 0.8,
                                    zIndex: 10,
                                },
                                zIndex: 5,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {event.task.title}
                            </Typography>
                            {position.height > 30 && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.6rem',
                                        display: 'block',
                                    }}
                                >
                                    {event.startTime.format('h:mm A')}
                                </Typography>
                            )}
                        </Paper>
                    </Tooltip>
                );
            })}

            {/* Deadline indicators (red lines at specific times) */}
            {deadlines.map((deadline, index) => {
                const urgency = getDeadlineUrgency(deadline.dueDateTime);
                const deadlineColor = getDeadlineColor(urgency);
                const hourFromMidnight = deadline.dueDateTime.diff(deadline.dueDateTime.startOf('day'), 'minute') / 60;
                const topPosition = hourFromMidnight * hourHeight;

                return (
                    <Tooltip
                        key={`deadline-${deadline.task.id}-${index}`}
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
                        <Box
                            onClick={() => handleTaskClick(deadline.task.id)}
                            sx={{
                                position: 'absolute',
                                top: `${topPosition}px`,
                                left: 0,
                                right: 0,
                                height: '3px',
                                backgroundColor: deadlineColor,
                                cursor: 'pointer',
                                zIndex: 15,
                                '&:hover': {
                                    height: '5px',
                                    top: `${topPosition - 1}px`,
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: '-3px',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '6px solid transparent',
                                    borderRight: '6px solid transparent',
                                    borderBottom: `6px solid ${deadlineColor}`,
                                },
                            }}
                        />
                    </Tooltip>
                );
            })}
        </Box>
    );
}
