import React from 'react';
import {
    Box,
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

export type CalendarView = 'month' | 'week' | 'day';

interface CalendarHeaderProps {
    title: string;
    view: CalendarView;
    onViewChange: (view: CalendarView) => void;
    onNavigate: (direction: 'prev' | 'next') => void;
}

export default function CalendarHeader({
    title,
    view,
    onViewChange,
    onNavigate,
}: CalendarHeaderProps) {
    const theme = useTheme();

    const handleViewChange = (
        event: React.MouseEvent<HTMLElement>,
        newView: CalendarView | null,
    ) => {
        if (newView !== null) {
            onViewChange(newView);
        }
    };

    return (
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
                    {title}
                </Typography>
                <Box>
                    <IconButton
                        onClick={() => onNavigate('prev')}
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => onNavigate('next')}
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
    );
}
