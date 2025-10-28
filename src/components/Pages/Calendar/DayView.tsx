import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import TimeSlotColumn from './TimeSlotColumn';

interface DayViewProps {
    selectedDate: Dayjs;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 80; // pixels per hour for day view (larger for better visibility)

export default function DayView({ selectedDate }: DayViewProps) {
    const theme = useTheme();

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
                    }}
                >
                    {/* Time labels column */}
                    <Box
                        sx={{
                            width: '100px',
                            flexShrink: 0,
                            position: 'relative',
                            pr: 2,
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
                    />
                </Box>
            </Box>
        </Box>
    );
}
