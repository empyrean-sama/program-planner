import { CalendarContextMenuCommand } from '../types/CalendarContextMenuTypes';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import React from 'react';

/**
 * Define all calendar context menu commands here.
 * This is the central registry for all context menu commands.
 */
export const calendarCommands: CalendarContextMenuCommand[] = [
    {
        id: 'view-task-details',
        label: 'View Task Details',
        icon: React.createElement(InfoIcon),
        action: (context: any) => {
            if (context.task && context.navigate) {
                context.navigate(`/tasks/${context.task.id}`, {
                    state: {
                        from: context.location?.pathname,
                        calendarView: context.view,
                        calendarDate: context.date?.format('YYYY-MM-DD'),
                    },
                });
            }
        },
        hidden: (context: any) => !context.task, // Only show when a task is selected
    },
    {
        id: 'delete-schedule-entry',
        label: 'Delete Occurrence',
        icon: React.createElement(DeleteIcon),
        action: async (context: any) => {
            if (context.task && context.scheduleEntryId && context.onScheduleDeleted) {
                // Call the delete handler passed in context
                await context.onScheduleDeleted(context.task.id, context.scheduleEntryId);
            }
        },
        hidden: (context: any) => !context.task || !context.scheduleEntryId, // Only show when on a scheduled task
    },
    {
        id: 'edit-schedule-entry',
        label: 'Edit Schedule Time',
        icon: React.createElement(EditIcon),
        action: (context: any) => {
            if (context.task && context.scheduleEntryId && context.onEditSchedule) {
                context.onEditSchedule(context.task.id, context.scheduleEntryId);
            }
        },
        hidden: (context: any) => !context.task || !context.scheduleEntryId,
    },
    {
        id: 'copy-schedule-entry',
        label: 'Duplicate to Another Time',
        icon: React.createElement(ContentCopyIcon),
        action: (context: any) => {
            if (context.task && context.onDuplicateSchedule) {
                context.onDuplicateSchedule(context.task.id);
            }
        },
        hidden: (context: any) => !context.task || !context.scheduleEntryId,
    },
    {
        id: 'divider-task-state',
        label: '',
        divider: true,
        action: () => {},
        hidden: (context: any) => !context.task, // Only show divider when on a task
    },
    {
        id: 'complete-task',
        label: 'Mark as Complete',
        icon: React.createElement(CheckCircleIcon),
        action: async (context: any) => {
            if (context.task && context.onChangeTaskState) {
                await context.onChangeTaskState(context.task.id, 'Finished');
            }
        },
        hidden: (context: any) => !context.task || context.task?.state === 'Finished',
    },
    {
        id: 'divider-1',
        label: '',
        divider: true,
        action: () => {},
    },
    {
        id: 'add-task-schedule',
        label: 'Add Task Schedule',
        icon: React.createElement(EventIcon),
        action: (context: any) => {
            // Call the openScheduleDialog function passed in context
            if (context.openScheduleDialog) {
                context.openScheduleDialog(context.date, context.hour);
            }
        },
        hidden: (context: any) => !!context.task, // Only show when NOT on a task card
    },
    {
        id: 'create-and-schedule',
        label: 'Create Task and Schedule',
        icon: React.createElement(EventNoteIcon),
        action: (context: any) => {
            // Call the openQuickCreateDialog function passed in context
            if (context.openQuickCreateDialog) {
                context.openQuickCreateDialog(context.date, context.hour);
            }
        },
        hidden: (context: any) => !!context.task, // Only show when NOT on a task card
    },
];
