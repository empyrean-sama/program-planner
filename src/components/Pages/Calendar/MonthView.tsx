import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface MonthViewProps {
    selectedDate: Dayjs;
    onDateSelect: (date: Dayjs) => void;
    onContextMenu?: (event: React.MouseEvent, date: Dayjs, hour?: number) => void;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthView({ selectedDate, onDateSelect, onContextMenu }: MonthViewProps) {
    const theme = useTheme();

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

                            return (
                                <Paper
                                    key={day.format('YYYY-MM-DD')}
                                    elevation={0}
                                    onClick={() => onDateSelect(day)}
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
                                        }}
                                    >
                                        {day.format('D')}
                                    </Typography>
                                </Paper>
                            );
                        })}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
