import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
    CalendarContextMenuPosition,
    CalendarContextMenuContext,
    CalendarContextMenuCommand,
} from './types/CalendarContextMenuTypes';

interface CalendarContextMenuProps {
    position: CalendarContextMenuPosition | null;
    context: CalendarContextMenuContext | null;
    commands: CalendarContextMenuCommand[];
    onClose: () => void;
}

export default function CalendarContextMenu({
    position,
    context,
    commands,
    onClose,
}: CalendarContextMenuProps) {
    const handleCommandClick = (command: CalendarContextMenuCommand) => {
        if (context) {
            command.action(context);
        }
        onClose();
    };

    if (!position || !context) {
        return null;
    }

    return (
        <Menu
            open={position !== null}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                position !== null
                    ? { top: position.mouseY, left: position.mouseX }
                    : undefined
            }
        >
            {commands.map((command) => {
                if (command.divider) {
                    return <Divider key={command.id} />;
                }

                const isDisabled = command.disabled ? command.disabled(context) : false;

                return (
                    <MenuItem
                        key={command.id}
                        onClick={() => handleCommandClick(command)}
                        disabled={isDisabled}
                    >
                        {command.icon && (
                            <ListItemIcon>
                                {command.icon}
                            </ListItemIcon>
                        )}
                        <ListItemText>{command.label}</ListItemText>
                    </MenuItem>
                );
            })}
        </Menu>
    );
}
