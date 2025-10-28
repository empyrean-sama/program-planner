import React, { useState } from 'react';
import {
    Box,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
    IconButton,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekday);
dayjs.extend(isoWeek);

type CalendarView = 'month' | 'week' | 'day';

export default function CalendarPage() {
    const theme = useTheme();
    const [view, setView] = useState<CalendarView>('month');
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

    const handleViewChange = (
        event: React.MouseEvent<HTMLElement>,
        newView: CalendarView | null,
    ) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        if (view === 'month') {
            setSelectedDate(selectedDate.add(direction === 'next' ? 1 : -1, 'month'));
        } else if (view === 'week') {
            setSelectedDate(selectedDate.add(direction === 'next' ? 1 : -1, 'week'));
        } else {
            setSelectedDate(selectedDate.add(direction === 'next' ? 1 : -1, 'day'));
        }
    };

    const renderMonthView = () => {
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

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                    {weekDays.map((day) => (
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
                                        onClick={() => setSelectedDate(day)}
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
    };

    const renderWeekView = () => {
        const startOfWeek = selectedDate.startOf('week');
        const weekDays = Array.from({ length: 7 }, (_, i) =>
            startOfWeek.add(i, 'day')
        );

        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Day headers */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '80px repeat(7, 1fr)',
                        gap: 1,
                        mb: 1,
                    }}
                >
                    <Box /> {/* Empty corner */}
                    {weekDays.map((day) => {
                        const isToday = day.isSame(dayjs(), 'day');
                        return (
                            <Box
                                key={day.format('YYYY-MM-DD')}
                                sx={{
                                    textAlign: 'center',
                                    py: 1,
                                    backgroundColor: isToday
                                        ? theme.palette.primary.main
                                        : theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 1,
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
                            </Box>
                        );
                    })}
                </Box>

                {/* Time grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateRows: `repeat(${hours.length}, 1fr)`,
                        gap: 1,
                        flex: 1,
                    }}
                >
                    {hours.map((hour) => (
                        <Box
                            key={hour}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '80px repeat(7, 1fr)',
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 1,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    {dayjs().hour(hour).format('h A')}
                                </Typography>
                            </Box>
                            {weekDays.map((day) => (
                                <Paper
                                    key={`${day.format('YYYY-MM-DD')}-${hour}`}
                                    elevation={0}
                                    sx={{
                                        backgroundColor: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.divider}`,
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    };

    const renderDayView = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);

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
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>
                        {selectedDate.format('dddd, MMMM D, YYYY')}
                    </Typography>
                </Box>

                {/* Hourly grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateRows: `repeat(${hours.length}, 1fr)`,
                        gap: 1,
                        flex: 1,
                    }}
                >
                    {hours.map((hour) => (
                        <Box
                            key={hour}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '100px 1fr',
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    pr: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    {dayjs().hour(hour).format('h:00 A')}
                                </Typography>
                            </Box>
                            <Paper
                                elevation={0}
                                sx={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                    },
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    };

    const getTitle = () => {
        if (view === 'month') {
            return selectedDate.format('MMMM YYYY');
        } else if (view === 'week') {
            const start = selectedDate.startOf('week');
            const end = selectedDate.endOf('week');
            return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
        } else {
            return selectedDate.format('MMMM D, YYYY');
        }
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 3,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                        }}
                    >
                        {getTitle()}
                    </Typography>
                    <Box>
                        <IconButton
                            onClick={() => navigateDate('prev')}
                            sx={{ color: theme.palette.text.secondary }}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => navigateDate('next')}
                            sx={{ color: theme.palette.text.secondary }}
                        >
                            <ChevronRightIcon />
                        </IconButton>
                    </Box>
                </Box>

                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    aria-label="calendar view"
                    sx={{
                        '& .MuiToggleButton-root': {
                            color: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                            '&.Mui-selected': {
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            },
                        },
                    }}
                >
                    <ToggleButton value="month" aria-label="month view">
                        <CalendarMonthIcon sx={{ mr: 1 }} />
                        Month
                    </ToggleButton>
                    <ToggleButton value="week" aria-label="week view">
                        <ViewWeekIcon sx={{ mr: 1 }} />
                        Week
                    </ToggleButton>
                    <ToggleButton value="day" aria-label="day view">
                        <ViewDayIcon sx={{ mr: 1 }} />
                        Day
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Calendar content */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'day' && renderDayView()}
            </Box>
        </Box>
    );
}

