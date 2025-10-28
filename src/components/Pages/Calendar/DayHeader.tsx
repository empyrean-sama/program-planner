import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface DayHeaderProps {
    day: Dayjs;
}

export default function DayHeader({ day }: DayHeaderProps) {
    const theme = useTheme();
    const isToday = day.isSame(dayjs(), 'day');

    return (
        <Box
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
}
