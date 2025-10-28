# Calendar Context Menu Framework

## Overview
The calendar now has a flexible context menu system that allows you to easily add new commands.

## Architecture

### Files Structure
```
Calendar/
├── CalendarPage.tsx                 # Main calendar component
├── CalendarContextMenu.tsx          # Context menu component
├── types/
│   └── CalendarContextMenuTypes.ts  # Type definitions
└── commands/
    └── calendarCommands.ts          # Command registry
```

### Key Components

1. **CalendarContextMenu** - Renders the context menu using MUI Menu component
2. **CalendarContextMenuTypes** - Type definitions for commands and context
3. **calendarCommands** - Central registry for all context menu commands

## Adding New Commands

To add a new command, simply add a new entry to the `calendarCommands` array in `commands/calendarCommands.ts`:

```typescript
import React from 'react';
import { CalendarContextMenuCommand } from '../types/CalendarContextMenuTypes';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export const calendarCommands: CalendarContextMenuCommand[] = [
    {
        id: 'my-command',              // Unique identifier
        label: 'My Command',           // Display text
        icon: React.createElement(AddIcon),  // Optional icon
        action: (context) => {         // Action to execute
            console.log('Date:', context.date.format('YYYY-MM-DD'));
            console.log('Hour:', context.hour);
            console.log('View:', context.view);
            // Your logic here
        },
        disabled: (context) => {       // Optional: disable based on context
            return false;              // Return true to disable
        },
    },
    // Add more commands...
];
```

## Command Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the command |
| `label` | string | Yes | Text displayed in the menu |
| `icon` | ReactNode | No | Icon to display (use `React.createElement(IconComponent)`) |
| `action` | function | Yes | Function called when command is executed |
| `disabled` | function | No | Function to determine if command should be disabled |
| `divider` | boolean | No | Set to `true` to render a divider instead |

## Context Information

When a command is executed, it receives a context object with:

```typescript
{
    date: Dayjs,           // The date that was right-clicked
    hour?: number,         // The hour (0-23) if in day/week view
    view: 'month' | 'week' | 'day'  // Current calendar view
}
```

## Example: Adding Multiple Commands

```typescript
export const calendarCommands: CalendarContextMenuCommand[] = [
    {
        id: 'create-event',
        label: 'Create Event',
        icon: React.createElement(AddIcon),
        action: (context) => {
            console.log('Creating event at', context.date.format('YYYY-MM-DD'));
            // Open event creation dialog
        },
    },
    {
        id: 'divider-1',
        label: '',
        divider: true,
        action: () => {},
    },
    {
        id: 'view-details',
        label: 'View Day Details',
        action: (context) => {
            console.log('Viewing details for', context.date.format('YYYY-MM-DD'));
            // Navigate to day view or show details
        },
        disabled: (context) => context.view === 'day', // Disable if already in day view
    },
];
```

## Usage

The context menu automatically appears when right-clicking on:
- **Month View**: Any day cell
- **Week View**: Any hour slot in any day column
- **Day View**: Any hour slot

The framework automatically:
- Tracks the clicked date and time
- Passes context to your command handlers
- Closes the menu after command execution
- Handles disabled states
- Supports dividers for grouping
