import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import DayHeader from './DayHeader';
import TimeSlotColumn from './TimeSlotColumn';

interface WeekViewProps {
    selectedDate: Dayjs;
    onContextMenu?: (event: React.MouseEvent, date: Dayjs, hour?: number) => void;
    onDayDoubleClick?: (date: Dayjs) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour

export default function WeekView({ selectedDate, onContextMenu, onDayDoubleClick }: WeekViewProps) {
    const theme = useTheme();
    const [selectedDayHeader, setSelectedDayHeader] = useState<Dayjs | null>(null);

    const getWeekDays = (): Dayjs[] => {
        const startOfWeek = selectedDate.startOf('week');
        return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    };

    const weekDays = getWeekDays();

    const handleDayHeaderClick = (day: Dayjs) => {
        setSelectedDayHeader(day);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
            {/* Day headers */}
            <Box
                sx={{
                    display: 'flex',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    backgroundColor: theme.palette.background.default,
                    mb: 1,
                }}
            >
                <Box sx={{ width: '80px', flexShrink: 0 }} /> {/* Empty corner */}
                {weekDays.map((day) => (
                    <DayHeader 
                        key={day.format('YYYY-MM-DD')} 
                        day={day}
                        onDoubleClick={onDayDoubleClick}
                        onClick={handleDayHeaderClick}
                        isSelected={selectedDayHeader?.isSame(day, 'day') || false}
                    />
                ))}
            </Box>

            {/* Time slots with absolute positioning */}
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
                        width: '80px',
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
                                justifyContent: 'center',
                                pt: 0.5,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.secondary }}
                            >
                                {dayjs().hour(hour).format('h A')}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Day columns */}
                {weekDays.map((day) => (
                    <TimeSlotColumn
                        key={day.format('YYYY-MM-DD')}
                        hours={HOURS}
                        hourHeight={HOUR_HEIGHT}
                        day={day}
                        onContextMenu={onContextMenu}
                    />
                ))}
            </Box>
        </Box>
    );
}
