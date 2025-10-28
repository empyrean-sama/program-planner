import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, useTheme, Chip } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Task } from '../../../types/Task';
import { getTaskDeadlinesForDate } from './utils/calendarTaskUtils';

interface MonthViewProps {
    selectedDate: Dayjs;
    onDateSelect: (date: Dayjs) => void;
    onContextMenu?: (event: React.MouseEvent, date: Dayjs, hour?: number) => void;
    onDayDoubleClick?: (date: Dayjs) => void;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthView({ selectedDate, onDateSelect, onContextMenu, onDayDoubleClick }: MonthViewProps) {
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

    const getMonthWeeks = (): Dayjs[][] => {
        const startOfMonth = selectedDate.startOf('month');
        const endOfMonth = selectedDate.endOf('month');
        const startDate = startOfMonth.startOf('week');
        const endDate = endOfMonth.endOf('week');

        const weeks: Dayjs[][] = [];
        let currentWeek: Dayjs[] = [];
        let currentDate = startDate;

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            currentWeek.push(currentDate);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            currentDate = currentDate.add(1, 'day');
        }

        return weeks;
    };

    const weeks = getMonthWeeks();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Week day headers */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 1,
                    mb: 1,
                }}
            >
                {WEEK_DAYS.map((day) => (
                    <Box
                        key={day}
                        sx={{
                            textAlign: 'center',
                            py: 1,
                            color: theme.palette.text.secondary,
                            fontWeight: 600,
                        }}
                    >
                        <Typography variant="body2">{day}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Calendar grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${weeks.length}, 1fr)`,
                    gap: 1,
                    flex: 1,
                }}
            >
                {weeks.map((week, weekIndex) => (
                    <Box
                        key={weekIndex}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: 1,
                        }}
                    >
                        {week.map((day) => {
                            const isSelected = day.isSame(selectedDate, 'day');
                            const isToday = day.isSame(dayjs(), 'day');
                            const isCurrentMonth = day.isSame(selectedDate, 'month');
                            const deadlines = getTaskDeadlinesForDate(tasks, day);
                            const deadlineCount = deadlines.length;

                            return (
                                <Paper
                                    key={day.format('YYYY-MM-DD')}
                                    elevation={0}
                                    onClick={() => onDateSelect(day)}
                                    onDoubleClick={() => onDayDoubleClick?.(day)}
                                    onContextMenu={(e) => onContextMenu?.(e, day)}
                                    sx={{
                                        p: 1.5,
                                        cursor: 'pointer',
                                        backgroundColor: isSelected
                                            ? theme.palette.primary.main
                                            : theme.palette.background.paper,
                                        border: `2px solid ${
                                            isToday
                                                ? theme.palette.secondary.main
                                                : theme.palette.divider
                                        }`,
                                        opacity: isCurrentMonth ? 1 : 0.4,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: '80px',
                                        '&:hover': {
                                            backgroundColor: isSelected
                                                ? theme.palette.primary.dark
                                                : theme.palette.action.hover,
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: isSelected
                                                ? theme.palette.primary.contrastText
                                                : theme.palette.text.primary,
                                            fontWeight: isToday ? 700 : 500,
                                            mb: 0.5,
                                        }}
                                    >
                                        {day.format('D')}
                                    </Typography>
                                    
                                    {/* Deadline count indicator */}
                                    {deadlineCount > 0 && (
                                        <Chip
                                            label={`${deadlineCount} deadline${deadlineCount > 1 ? 's' : ''}`}
                                            size="small"
                                            sx={{
                                                height: '20px',
                                                fontSize: '0.7rem',
                                                backgroundColor: theme.palette.error.main,
                                                color: theme.palette.error.contrastText,
                                                fontWeight: 600,
                                            }}
                                        />
                                    )}
                                </Paper>
                            );
                        })}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
