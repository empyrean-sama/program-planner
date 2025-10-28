import React, { useState } from 'react';
import { Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';
import CalendarHeader, { CalendarView } from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import CalendarContextMenu from './CalendarContextMenu';
import { calendarCommands } from './commands/calendarCommands';
import {
    CalendarContextMenuPosition,
    CalendarContextMenuContext,
} from './types/CalendarContextMenuTypes';

dayjs.extend(weekday);
dayjs.extend(isoWeek);

export default function CalendarPage() {
    const [view, setView] = useState<CalendarView>('month');
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [contextMenu, setContextMenu] = useState<CalendarContextMenuPosition | null>(null);
    const [contextMenuContext, setContextMenuContext] =
        useState<CalendarContextMenuContext | null>(null);

    const handleViewChange = (newView: CalendarView) => {
        setView(newView);
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

    const handleContextMenu = (
        event: React.MouseEvent,
        date: Dayjs,
        hour?: number
    ) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
        });
        setContextMenuContext({
            date,
            hour,
            view,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
        setContextMenuContext(null);
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 3,
            }}
        >
            <CalendarHeader
                title={getTitle()}
                view={view}
                onViewChange={handleViewChange}
                onNavigate={navigateDate}
            />

            {/* Calendar content */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
                {view === 'month' && (
                    <MonthView
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        onContextMenu={handleContextMenu}
                    />
                )}
                {view === 'week' && (
                    <WeekView
                        selectedDate={selectedDate}
                        onContextMenu={handleContextMenu}
                    />
                )}
                {view === 'day' && (
                    <DayView
                        selectedDate={selectedDate}
                        onContextMenu={handleContextMenu}
                    />
                )}
            </Box>

            <CalendarContextMenu
                position={contextMenu}
                context={contextMenuContext}
                commands={calendarCommands}
                onClose={handleCloseContextMenu}
            />
        </Box>
    );
}

