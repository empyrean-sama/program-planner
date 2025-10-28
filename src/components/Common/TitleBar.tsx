import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/CropSquare';
import CloseIcon from '@mui/icons-material/Close';
import AppIcon from '../Common/AppIcon';

export default function TitleBar() {
    const theme = useTheme();

    const handleMinimize = () => {
        if (window.electron) {
            window.electron.minimize();
        }
    };

    const handleMaximize = () => {
        if (window.electron) {
            window.electron.maximize();
        }
    };

    const handleClose = () => {
        if (window.electron) {
            window.electron.close();
        }
    };

    return (
        <Box
            sx={{
                height: 32,
                backgroundColor: '#202225',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                WebkitAppRegion: 'drag',
                userSelect: 'none',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AppIcon sx={{ fontSize: 20 }} />
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                    }}
                >
                    Program Planner
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', WebkitAppRegion: 'no-drag' }}>
                <IconButton
                    size="small"
                    onClick={handleMinimize}
                    sx={{
                        color: theme.palette.text.secondary,
                        borderRadius: 0,
                        width: 46,
                        height: 32,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    }}
                >
                    <MinimizeIcon fontSize="small" />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={handleMaximize}
                    sx={{
                        color: theme.palette.text.secondary,
                        borderRadius: 0,
                        width: 46,
                        height: 32,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    }}
                >
                    <MaximizeIcon fontSize="small" />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={handleClose}
                    sx={{
                        color: theme.palette.text.secondary,
                        borderRadius: 0,
                        width: 46,
                        height: 32,
                        '&:hover': {
                            backgroundColor: '#ED4245',
                            color: '#FFFFFF',
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}
