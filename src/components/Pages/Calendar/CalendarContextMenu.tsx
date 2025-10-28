import React from 'react';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Paper,
    useTheme,
    alpha,
} from '@mui/material';
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
    const theme = useTheme();

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
            slotProps={{
                paper: {
                    elevation: 8,
                    sx: {
                        minWidth: 220,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundImage: 'none',
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: `0px 5px 15px ${alpha(theme.palette.common.black, 0.2)}`,
                        '& .MuiList-root': {
                            py: 1,
                        },
                    },
                },
            }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
            transitionDuration={200}
        >
            {commands.map((command) => {
                if (command.divider) {
                    return (
                        <Divider
                            key={command.id}
                            sx={{
                                my: 1,
                                borderColor: alpha(theme.palette.divider, 0.5),
                            }}
                        />
                    );
                }

                const isDisabled = command.disabled ? command.disabled(context) : false;

                return (
                    <MenuItem
                        key={command.id}
                        onClick={() => handleCommandClick(command)}
                        disabled={isDisabled}
                        sx={{
                            mx: 1,
                            my: 0.25,
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                transform: 'translateX(2px)',
                            },
                            '&.Mui-disabled': {
                                opacity: 0.4,
                            },
                            '& .MuiListItemIcon-root': {
                                minWidth: 36,
                                color: theme.palette.text.secondary,
                            },
                            '& .MuiListItemText-root': {
                                '& .MuiTypography-root': {
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                },
                            },
                        }}
                    >
                        {command.icon && (
                            <ListItemIcon
                                sx={{
                                    transition: 'color 0.2s ease',
                                    '&:hover': {
                                        color: theme.palette.primary.main,
                                    },
                                }}
                            >
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
