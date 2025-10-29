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
import { CalendarSkeleton } from '../../Common/LoadingSkeletons';
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

// Consolidated state interfaces for better organization
interface ScheduleDialogState {
    open: boolean;
    date?: Dayjs;
    hour?: number;
    taskId?: string;
    taskReadonly: boolean;
}

interface QuickCreateDialogState {
    open: boolean;
    date?: Dayjs;
    hour?: number;
}

interface EditScheduleDialogState {
    open: boolean;
    taskId: string | null;
    entryId: string | null;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
}

interface CalendarState {
    loading: boolean;
    view: CalendarView;
    selectedDate: Dayjs;
    refreshKey: number;
}

export default function CalendarPage() {
    const globalState = useAppGlobalState();
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as LocationState | null;
    
    // Consolidated state objects
    const [calendarState, setCalendarState] = useState<CalendarState>({
        loading: true,
        view: 'month',
        selectedDate: dayjs(),
        refreshKey: 0,
    });
    
    const [contextMenu, setContextMenu] = useState<CalendarContextMenuPosition | null>(null);
    const [contextMenuContext, setContextMenuContext] = useState<CalendarContextMenuContext | null>(null);
    
    const [scheduleDialog, setScheduleDialog] = useState<ScheduleDialogState>({
        open: false,
        date: undefined,
        hour: undefined,
        taskId: undefined,
        taskReadonly: false,
    });
    
    const [quickCreateDialog, setQuickCreateDialog] = useState<QuickCreateDialogState>({
        open: false,
        date: undefined,
        hour: undefined,
    });
    
    const [editScheduleDialog, setEditScheduleDialog] = useState<EditScheduleDialogState>({
        open: false,
        taskId: null,
        entryId: null,
        startTime: null,
        endTime: null,
    });

    // Restore view and date from navigation state if coming back from task details
    useEffect(() => {
        if (locationState?.view || locationState?.date) {
            setCalendarState(prev => ({
                ...prev,
                ...(locationState.view && { view: locationState.view }),
                ...(locationState.date && { selectedDate: dayjs(locationState.date) }),
            }));
        }
    }, [locationState]);

    // Set initial loading to false after a short delay (views handle their own data)
    useEffect(() => {
        const timer = setTimeout(() => {
            setCalendarState(prev => ({ ...prev, loading: false }));
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleViewChange = (newView: CalendarView) => {
        setCalendarState(prev => ({ ...prev, view: newView }));
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        setCalendarState(prev => {
            const { view, selectedDate } = prev;
            let newDate = selectedDate;
            
            if (view === 'month') {
                newDate = selectedDate.add(direction === 'next' ? 1 : -1, 'month');
            } else if (view === 'week') {
                newDate = selectedDate.add(direction === 'next' ? 1 : -1, 'week');
            } else {
                newDate = selectedDate.add(direction === 'next' ? 1 : -1, 'day');
            }
            
            return { ...prev, selectedDate: newDate };
        });
    };

    const getTitle = () => {
        const { view, selectedDate } = calendarState;
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
            view: calendarState.view,
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
        setCalendarState(prev => ({
            ...prev,
            selectedDate: date,
            view: 'day',
        }));
    };

    const openScheduleDialog = (date?: Dayjs, hour?: number) => {
        setScheduleDialog({
            open: true,
            date,
            hour,
            taskId: scheduleDialog.taskId,
            taskReadonly: scheduleDialog.taskReadonly,
        });
        handleCloseContextMenu();
    };

    const handleScheduleAdded = () => {
        // Refresh calendar views by incrementing refresh key
        setCalendarState(prev => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
        setScheduleDialog({
            open: false,
            date: undefined,
            hour: undefined,
            taskId: undefined,
            taskReadonly: false,
        });
        globalState.showToast('Schedule entry added successfully', 'success', 3000);
    };

    const openQuickCreateDialog = (date?: Dayjs, hour?: number) => {
        setQuickCreateDialog({
            open: true,
            date,
            hour,
        });
        handleCloseContextMenu();
    };

    const handleQuickTaskCreated = (taskId?: string) => {
        // Close the task dialog and immediately open the schedule dialog
        const prevDate = quickCreateDialog.date;
        const prevHour = quickCreateDialog.hour;
        
        setQuickCreateDialog({
            open: false,
            date: undefined,
            hour: undefined,
        });
        
        // Wait a moment for the task creation to complete, then open schedule dialog
        setTimeout(() => {
            setScheduleDialog({
                open: true,
                date: prevDate,
                hour: prevHour,
                taskId,
                taskReadonly: true,
            });
            globalState.showToast('Task created! Now add a schedule.', 'success', 2000);
        }, 200);
    };

    const handleScheduleDeleted = async (taskId: string, entryId: string) => {
        try {
            const result = await window.taskAPI.removeScheduleEntry(taskId, entryId);
            if (result.success) {
                setCalendarState(prev => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
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
                    setEditScheduleDialog({
                        open: true,
                        taskId,
                        entryId,
                        startTime: dayjs(entry.startTime),
                        endTime: dayjs(entry.endTime),
                    });
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
        setCalendarState(prev => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
        setEditScheduleDialog({
            open: false,
            taskId: null,
            entryId: null,
            startTime: null,
            endTime: null,
        });
        globalState.showToast('Schedule updated successfully', 'success', 3000);
    };

    const handleDuplicateSchedule = (taskId: string) => {
        // Open the schedule dialog with the same task pre-selected
        setScheduleDialog({
            ...scheduleDialog,
            open: true,
            taskId,
            taskReadonly: true,
        });
        handleCloseContextMenu();
        globalState.showToast('Select new time for this task', 'info', 2000);
    };

    const handleChangeTaskState = async (taskId: string, newState: string) => {
        try {
            const result = await window.taskAPI.updateTask({ id: taskId, state: newState as any });
            if (result.success) {
                setCalendarState(prev => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
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
                view={calendarState.view}
                onViewChange={handleViewChange}
                onNavigate={navigateDate}
            />

            {/* Calendar content */}
            {calendarState.loading ? (
                <CalendarSkeleton view={calendarState.view} />
            ) : (
                <Box sx={{ flex: 1, minHeight: 0 }}>
                    {calendarState.view === 'month' && (
                        <MonthView
                            key={`month-${calendarState.refreshKey}`}
                            selectedDate={calendarState.selectedDate}
                            onDateSelect={(date) => setCalendarState(prev => ({ ...prev, selectedDate: date }))}
                            onContextMenu={handleContextMenu}
                            onDayDoubleClick={handleDayDoubleClick}
                        />
                    )}
                    {calendarState.view === 'week' && (
                        <WeekView
                            key={`week-${calendarState.refreshKey}`}
                            selectedDate={calendarState.selectedDate}
                            onContextMenu={handleContextMenu}
                            onDayDoubleClick={handleDayDoubleClick}
                        />
                    )}
                    {calendarState.view === 'day' && (
                        <DayView
                            key={`day-${calendarState.refreshKey}`}
                            selectedDate={calendarState.selectedDate}
                            onContextMenu={handleContextMenu}
                        />
                    )}
                </Box>
            )}

            <CalendarContextMenu
                position={contextMenu}
                context={contextMenuContext ? contextWithDialog : null}
                commands={calendarCommands}
                onClose={handleCloseContextMenu}
            />

            <AddTaskScheduleDialog
                open={scheduleDialog.open}
                initialDate={scheduleDialog.date}
                initialHour={scheduleDialog.hour}
                initialTaskId={scheduleDialog.taskId}
                taskReadonly={scheduleDialog.taskReadonly}
                onClose={() => {
                    setScheduleDialog({
                        open: false,
                        date: undefined,
                        hour: undefined,
                        taskId: undefined,
                        taskReadonly: false,
                    });
                }}
                onEntryAdded={handleScheduleAdded}
            />

            <EditScheduleDialog
                open={editScheduleDialog.open}
                taskId={editScheduleDialog.taskId}
                entryId={editScheduleDialog.entryId}
                initialStartTime={editScheduleDialog.startTime}
                initialEndTime={editScheduleDialog.endTime}
                onClose={() => setEditScheduleDialog({
                    open: false,
                    taskId: null,
                    entryId: null,
                    startTime: null,
                    endTime: null,
                })}
                onEntryUpdated={handleScheduleUpdated}
            />

            <TaskDialog
                open={quickCreateDialog.open}
                onClose={() => setQuickCreateDialog({
                    open: false,
                    date: undefined,
                    hour: undefined,
                })}
                onTaskCreated={handleQuickTaskCreated}
            />
        </Box>
    );
}

