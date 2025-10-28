import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useLocation } from 'react-router';
import CalendarHeader, { CalendarView } from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import CalendarContextMenu from './CalendarContextMenu';
import AddTaskScheduleDialog from './AddTaskScheduleDialog';
import { calendarCommands } from './commands/calendarCommands';
import {
    CalendarContextMenuPosition,
    CalendarContextMenuContext,
} from './types/CalendarContextMenuTypes';
import useAppGlobalState from '../../../hooks/useAppGlobalState';

dayjs.extend(weekday);
dayjs.extend(isoWeek);

interface LocationState {
    view?: CalendarView;
    date?: string;
}

export default function CalendarPage() {
    const globalState = useAppGlobalState();
    const location = useLocation();
    const locationState = location.state as LocationState | null;
    
    const [view, setView] = useState<CalendarView>('month');
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [contextMenu, setContextMenu] = useState<CalendarContextMenuPosition | null>(null);
    const [contextMenuContext, setContextMenuContext] =
        useState<CalendarContextMenuContext | null>(null);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [scheduleDialogDate, setScheduleDialogDate] = useState<Dayjs | undefined>(undefined);
    const [scheduleDialogHour, setScheduleDialogHour] = useState<number | undefined>(undefined);
    const [refreshKey, setRefreshKey] = useState(0);

    // Restore view and date from navigation state if coming back from task details
    useEffect(() => {
        if (locationState?.view) {
            setView(locationState.view);
        }
        if (locationState?.date) {
            setSelectedDate(dayjs(locationState.date));
        }
    }, [locationState]);

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
            globalState,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
        setContextMenuContext(null);
    };

    const handleDayDoubleClick = (date: Dayjs) => {
        setSelectedDate(date);
        setView('day');
    };

    const openScheduleDialog = (date?: Dayjs, hour?: number) => {
        setScheduleDialogDate(date);
        setScheduleDialogHour(hour);
        setScheduleDialogOpen(true);
        handleCloseContextMenu();
    };

    const handleScheduleAdded = () => {
        // Refresh calendar views by incrementing refresh key
        setRefreshKey(prev => prev + 1);
        setScheduleDialogOpen(false);
        globalState.showToast('Schedule entry added successfully', 'success', 3000);
    };

    // Expose openScheduleDialog to context for commands
    const contextWithDialog: CalendarContextMenuContext & { openScheduleDialog: (date?: Dayjs, hour?: number) => void } = {
        ...contextMenuContext!,
        openScheduleDialog,
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
                        key={`month-${refreshKey}`}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        onContextMenu={handleContextMenu}
                        onDayDoubleClick={handleDayDoubleClick}
                    />
                )}
                {view === 'week' && (
                    <WeekView
                        key={`week-${refreshKey}`}
                        selectedDate={selectedDate}
                        onContextMenu={handleContextMenu}
                        onDayDoubleClick={handleDayDoubleClick}
                    />
                )}
                {view === 'day' && (
                    <DayView
                        key={`day-${refreshKey}`}
                        selectedDate={selectedDate}
                        onContextMenu={handleContextMenu}
                    />
                )}
            </Box>

            <CalendarContextMenu
                position={contextMenu}
                context={contextMenuContext ? contextWithDialog : null}
                commands={calendarCommands}
                onClose={handleCloseContextMenu}
            />

            <AddTaskScheduleDialog
                open={scheduleDialogOpen}
                initialDate={scheduleDialogDate}
                initialHour={scheduleDialogHour}
                onClose={() => setScheduleDialogOpen(false)}
                onEntryAdded={handleScheduleAdded}
            />
        </Box>
    );
}

