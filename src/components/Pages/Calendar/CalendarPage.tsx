import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useLocation, useNavigate } from 'react-router';
import CalendarHeader, { CalendarView } from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import CalendarContextMenu from './CalendarContextMenu';
import AddTaskScheduleDialog from './AddTaskScheduleDialog';
import EditScheduleDialog from './EditScheduleDialog';
import TaskDialog from '../Tasks/TaskDialog';
import { calendarCommands } from './commands/calendarCommands';
import {
    CalendarContextMenuPosition,
    CalendarContextMenuContext,
} from './types/CalendarContextMenuTypes';
import useAppGlobalState from '../../../hooks/useAppGlobalState';
import { Task } from '../../../types/Task';

dayjs.extend(weekday);
dayjs.extend(isoWeek);

interface LocationState {
    view?: CalendarView;
    date?: string;
}

export default function CalendarPage() {
    const globalState = useAppGlobalState();
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as LocationState | null;
    
    const [view, setView] = useState<CalendarView>('month');
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [contextMenu, setContextMenu] = useState<CalendarContextMenuPosition | null>(null);
    const [contextMenuContext, setContextMenuContext] =
        useState<CalendarContextMenuContext | null>(null);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [scheduleDialogDate, setScheduleDialogDate] = useState<Dayjs | undefined>(undefined);
    const [scheduleDialogHour, setScheduleDialogHour] = useState<number | undefined>(undefined);
    const [scheduleDialogTaskId, setScheduleDialogTaskId] = useState<string | undefined>(undefined);
    const [scheduleDialogTaskReadonly, setScheduleDialogTaskReadonly] = useState(false);
    const [quickCreateDialogOpen, setQuickCreateDialogOpen] = useState(false);
    const [quickCreateDate, setQuickCreateDate] = useState<Dayjs | undefined>(undefined);
    const [quickCreateHour, setQuickCreateHour] = useState<number | undefined>(undefined);
    const [editScheduleDialogOpen, setEditScheduleDialogOpen] = useState(false);
    const [editScheduleTaskId, setEditScheduleTaskId] = useState<string | null>(null);
    const [editScheduleEntryId, setEditScheduleEntryId] = useState<string | null>(null);
    const [editScheduleStartTime, setEditScheduleStartTime] = useState<Dayjs | null>(null);
    const [editScheduleEndTime, setEditScheduleEndTime] = useState<Dayjs | null>(null);
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
        hour?: number,
        task?: Task,
        scheduleEntryId?: string
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
            task,
            scheduleEntryId,
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
        // Reset task-related state
        setScheduleDialogTaskId(undefined);
        setScheduleDialogTaskReadonly(false);
        globalState.showToast('Schedule entry added successfully', 'success', 3000);
    };

    const openQuickCreateDialog = (date?: Dayjs, hour?: number) => {
        setQuickCreateDate(date);
        setQuickCreateHour(hour);
        setQuickCreateDialogOpen(true);
        handleCloseContextMenu();
    };

    const handleQuickTaskCreated = (taskId?: string) => {
        // Close the task dialog and immediately open the schedule dialog
        setQuickCreateDialogOpen(false);
        // Wait a moment for the task creation to complete, then open schedule dialog
        setTimeout(() => {
            setScheduleDialogTaskId(taskId);
            setScheduleDialogTaskReadonly(true);
            openScheduleDialog(quickCreateDate, quickCreateHour);
            globalState.showToast('Task created! Now add a schedule.', 'success', 2000);
        }, 200);
    };

    const handleScheduleDeleted = async (taskId: string, entryId: string) => {
        try {
            const result = await window.taskAPI.removeScheduleEntry(taskId, entryId);
            if (result.success) {
                setRefreshKey(prev => prev + 1);
                handleCloseContextMenu();
                globalState.showToast('Schedule entry deleted', 'success', 3000);
            } else {
                globalState.showToast(result.error || 'Failed to delete schedule entry', 'error', 3000);
            }
        } catch (error) {
            globalState.showToast('Failed to delete schedule entry', 'error', 3000);
        }
    };

    const handleEditSchedule = async (taskId: string, entryId: string) => {
        try {
            // Fetch the task to get the schedule entry details
            const result = await window.taskAPI.getTaskById(taskId);
            if (result.success && result.data) {
                const entry = result.data.scheduleHistory.find(e => e.id === entryId);
                if (entry) {
                    setEditScheduleTaskId(taskId);
                    setEditScheduleEntryId(entryId);
                    setEditScheduleStartTime(dayjs(entry.startTime));
                    setEditScheduleEndTime(dayjs(entry.endTime));
                    setEditScheduleDialogOpen(true);
                    handleCloseContextMenu();
                } else {
                    globalState.showToast('Schedule entry not found', 'error', 3000);
                }
            } else {
                globalState.showToast(result.error || 'Failed to load task', 'error', 3000);
            }
        } catch (error) {
            globalState.showToast('Failed to load schedule entry', 'error', 3000);
        }
    };

    const handleScheduleUpdated = () => {
        setRefreshKey(prev => prev + 1);
        setEditScheduleDialogOpen(false);
        globalState.showToast('Schedule updated successfully', 'success', 3000);
    };

    const handleDuplicateSchedule = (taskId: string) => {
        // Open the schedule dialog with the same task pre-selected
        setScheduleDialogTaskId(taskId);
        setScheduleDialogTaskReadonly(true);
        setScheduleDialogOpen(true);
        handleCloseContextMenu();
        globalState.showToast('Select new time for this task', 'info', 2000);
    };

    const handleChangeTaskState = async (taskId: string, newState: string) => {
        try {
            const result = await window.taskAPI.updateTask({ id: taskId, state: newState as any });
            if (result.success) {
                setRefreshKey(prev => prev + 1);
                handleCloseContextMenu();
                const stateLabels: Record<string, string> = {
                    'Doing': 'started',
                    'Finished': 'completed',
                };
                globalState.showToast(`Task ${stateLabels[newState] || 'updated'}`, 'success', 3000);
            } else {
                globalState.showToast(result.error || 'Failed to update task', 'error', 3000);
            }
        } catch (error) {
            globalState.showToast('Failed to update task', 'error', 3000);
        }
    };

    // Expose openScheduleDialog, openQuickCreateDialog, navigate, and location to context for commands
    const contextWithDialog: CalendarContextMenuContext & { 
        openScheduleDialog: (date?: Dayjs, hour?: number) => void;
        openQuickCreateDialog: (date?: Dayjs, hour?: number) => void;
        onScheduleDeleted: (taskId: string, entryId: string) => Promise<void>;
        onEditSchedule: (taskId: string, entryId: string) => void;
        onDuplicateSchedule: (taskId: string) => void;
        onChangeTaskState: (taskId: string, newState: string) => Promise<void>;
        navigate: ReturnType<typeof useNavigate>;
        location: ReturnType<typeof useLocation>;
    } = {
        ...contextMenuContext!,
        openScheduleDialog,
        openQuickCreateDialog,
        onScheduleDeleted: handleScheduleDeleted,
        onEditSchedule: handleEditSchedule,
        onDuplicateSchedule: handleDuplicateSchedule,
        onChangeTaskState: handleChangeTaskState,
        navigate,
        location,
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
                initialTaskId={scheduleDialogTaskId}
                taskReadonly={scheduleDialogTaskReadonly}
                onClose={() => {
                    setScheduleDialogOpen(false);
                    setScheduleDialogTaskId(undefined);
                    setScheduleDialogTaskReadonly(false);
                }}
                onEntryAdded={handleScheduleAdded}
            />

            <EditScheduleDialog
                open={editScheduleDialogOpen}
                taskId={editScheduleTaskId}
                entryId={editScheduleEntryId}
                initialStartTime={editScheduleStartTime}
                initialEndTime={editScheduleEndTime}
                onClose={() => setEditScheduleDialogOpen(false)}
                onEntryUpdated={handleScheduleUpdated}
            />

            <TaskDialog
                open={quickCreateDialogOpen}
                onClose={() => setQuickCreateDialogOpen(false)}
                onTaskCreated={handleQuickTaskCreated}
            />
        </Box>
    );
}

