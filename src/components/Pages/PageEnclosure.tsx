import React from 'react';
import { Outlet } from 'react-router';
import { Box, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TitleBar from '../Common/TitleBar';

export default function PageEnclosure() {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <TitleBar />
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        height: '100%',
                        overflow: 'auto',
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}