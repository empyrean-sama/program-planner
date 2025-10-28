import { CalendarContextMenuCommand } from '../types/CalendarContextMenuTypes';
import EventIcon from '@mui/icons-material/Event';
import React from 'react';

/**
 * Define all calendar context menu commands here.
 * This is the central registry for all context menu commands.
 */
export const calendarCommands: CalendarContextMenuCommand[] = [
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
];
