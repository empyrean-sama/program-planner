import { CalendarContextMenuCommand } from '../types/CalendarContextMenuTypes';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';

/**
 * Define all calendar context menu commands here.
 * This is the central registry for all context menu commands.
 */
export const calendarCommands: CalendarContextMenuCommand[] = [
    {
        id: 'hello-world',
        label: 'Hello World',
        icon: React.createElement(AddIcon),
        action: (context) => {
            console.log('Hello World!');
            console.log('Context:', {
                date: context.date.format('YYYY-MM-DD'),
                hour: context.hour,
                view: context.view,
            });
            
            // Show toast notification
            context.globalState.showToast(
                `Hello World! Date: ${context.date.format('MMMM D, YYYY')}${context.hour !== undefined ? ` at ${context.hour}:00` : ''}`,
                'success',
                4000
            );
        },
    },
    // Add more commands here as needed
    // Example:
    // {
    //     id: 'create-event',
    //     label: 'Create Event',
    //     icon: React.createElement(AddIcon),
    //     action: (context) => {
    //         console.log('Creating event for:', context.date.format('YYYY-MM-DD'));
    //         // Handle create event logic here
    //     },
    // },
    // {
    //     id: 'divider-1',
    //     label: '',
    //     divider: true,
    //     action: () => {},
    // },
    // {
    //     id: 'delete-event',
    //     label: 'Delete Event',
    //     icon: React.createElement(DeleteIcon),
    //     action: (context) => {
    //         // Handle delete event logic here
    //     },
    //     disabled: (context) => {
    //         // Return true to disable this command based on context
    //         return false;
    //     },
    // },
];
