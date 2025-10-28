import React from 'react';
import { Box, useTheme } from '@mui/material';

interface TimeSlotColumnProps {
    hours: number[];
    hourHeight: number;
    showBorderLeft?: boolean;
}

export default function TimeSlotColumn({ 
    hours, 
    hourHeight,
    showBorderLeft = true 
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
