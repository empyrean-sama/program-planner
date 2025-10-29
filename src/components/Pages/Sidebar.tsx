import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    Toolbar,
    Divider,
    useTheme,
    Tooltip,
    Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AppIcon from '../Common/AppIcon';

const DRAWER_WIDTH = 72;

interface NavItem {
    text: string;
    icon: React.ReactElement;
    path: string;
}

const navItems: NavItem[] = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
    { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
    { text: 'Metrics', icon: <BarChartIcon />, path: '/metrics' },
];

const bottomNavItems: NavItem[] = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const renderNavItem = (item: NavItem) => {
        const isSelected = location.pathname === item.path;
        return (
            <Tooltip 
                key={item.text} 
                title={item.text} 
                placement="right"
                arrow
            >
                <ListItemButton
                    selected={isSelected}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                        mb: 0.5,
                        justifyContent: 'center',
                        px: 2,
                        minHeight: 48,
                        '&:hover .MuiListItemIcon-root': {
                            color: theme.palette.text.primary,
                            transform: 'scale(1.1)',
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 'auto',
                            color: isSelected
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                            justifyContent: 'center',
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                </ListItemButton>
            </Tooltip>
        );
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: '#202225', // Discord sidebar color
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: 'none',
                },
            }}
        >
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1,
                    minHeight: 64,
                    backgroundColor: '#2F3136',
                }}
            >
                <AppIcon
                    sx={{
                        fontSize: 40,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.15) rotate(5deg)',
                        },
                    }}
                    onClick={() => navigate('/')}
                />
            </Toolbar>
            <Divider sx={{ borderColor: '#18191C' }} />
            
            <List sx={{ pt: 2, px: 1 }}>
                {navItems.map(renderNavItem)}
            </List>
            
            {/* Spacer to push bottom items down */}
            <Box sx={{ flexGrow: 1 }} />
            
            <List sx={{ pb: 2, px: 1 }}>
                {bottomNavItems.map(renderNavItem)}
            </List>
        </Drawer>
    );
}
