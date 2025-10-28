import React from 'react';
import { Outlet } from 'react-router';
import { Box, useTheme } from '@mui/material';
import Sidebar from './Sidebar';

export default function PageEnclosure() {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}