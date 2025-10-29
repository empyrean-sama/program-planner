import { CalendarContextMenuCommand } from '../types/CalendarContextMenuTypes';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import EventNoteIcon from '@mui/icons-material/EventNote';
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
        disabled: (context: any) => !context.task, // Only enabled when a task is selected
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
    },
];
