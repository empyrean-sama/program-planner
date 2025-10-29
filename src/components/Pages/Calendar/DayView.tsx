import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Chip } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import TimeSlotColumn from './TimeSlotColumn';
import { Task } from '../../../types/Task';
import { getTaskDeadlinesForDate, getDeadlineColor, getDeadlineUrgency } from './utils/calendarTaskUtils';

interface DayViewProps {
    selectedDate: Dayjs;
    onContextMenu?: (event: React.MouseEvent, date: Dayjs, hour?: number, task?: Task, scheduleEntryId?: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 80; // pixels per hour for day view (larger for better visibility)

export default function DayView({ selectedDate, onContextMenu }: DayViewProps) {
    const theme = useTheme();
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

    // Get deadlines for the selected day
    const deadlines = getTaskDeadlinesForDate(tasks, selectedDate);

    const handleDeadlineContextMenu = (e: React.MouseEvent, task: Task) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
            onContextMenu(e, selectedDate, undefined, task, undefined);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Day header */}
            <Box
                sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                }}
            >
                <Typography variant="h5" sx={{ color: theme.palette.text.primary, textAlign: 'center', mb: deadlines.length > 0 ? 1 : 0 }}>
                    {selectedDate.format('dddd, MMMM D, YYYY')}
                </Typography>
                
                {/* Deadline indicators */}
                {deadlines.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            justifyContent: 'center',
                            maxHeight: '80px',
                            overflow: 'auto',
                        }}
                    >
                        {deadlines.map((deadline, index) => {
                            const urgency = getDeadlineUrgency(deadline.dueDateTime);
                            const deadlineColor = getDeadlineColor(urgency);
                            
                            return (
                                <Chip
                                    key={`deadline-${deadline.task.id}-${index}`}
                                    label={`⚠️ ${deadline.task.title}`}
                                    size="small"
                                    onContextMenu={(e) => handleDeadlineContextMenu(e, deadline.task)}
                                    sx={{
                                        backgroundColor: deadlineColor,
                                        color: '#fff',
                                        fontWeight: 500,
                                        cursor: 'context-menu',
                                        '&:hover': {
                                            opacity: 0.8,
                                        },
                                    }}
                                />
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Hourly timeline with absolute positioning */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        position: 'relative',
                        minHeight: `${HOURS.length * HOUR_HEIGHT}px`,
                        gap: 2,
                    }}
                >
                    {/* Time labels column */}
                    <Box
                        sx={{
                            width: '100px',
                            flexShrink: 0,
                            position: 'relative',
                        }}
                    >
                        {HOURS.map((hour) => (
                            <Box
                                key={hour}
                                sx={{
                                    position: 'absolute',
                                    top: `${hour * HOUR_HEIGHT}px`,
                                    left: 0,
                                    right: 0,
                                    height: `${HOUR_HEIGHT}px`,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-end',
                                    pt: 0.5,
                                    pr: 1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    {dayjs().hour(hour).format('h:00 A')}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Event container with time slots */}
                    <TimeSlotColumn
                        hours={HOURS}
                        hourHeight={HOUR_HEIGHT}
                        showBorderLeft
                        day={selectedDate}
                        onContextMenu={onContextMenu}
                        currentView="day"
                        currentDate={selectedDate}
                        tasks={tasks}
                        onTasksUpdate={loadTasks}
                    />
                </Box>
            </Box>
        </Box>
    );
}
