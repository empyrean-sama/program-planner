import React from 'react';
import { Box, useTheme } from '@mui/material';
import { Dayjs } from 'dayjs';

interface TimeSlotColumnProps {
    hours: number[];
    hourHeight: number;
    showBorderLeft?: boolean;
    day?: Dayjs;
    onContextMenu?: (event: React.MouseEvent, date: Dayjs, hour?: number) => void;
}

export default function TimeSlotColumn({ 
    hours, 
    hourHeight,
    showBorderLeft = true,
    day,
    onContextMenu,
}: TimeSlotColumnProps) {
    const theme = useTheme();

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
            {/* Events can be added here with absolute positioning */}
        </Box>
    );
}
