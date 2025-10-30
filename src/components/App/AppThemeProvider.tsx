import React from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

export default function AppThemeProvider(props: React.PropsWithChildren) {
    const theme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#5865F2', // Discord blurple - good contrast
                light: '#7289DA',
                dark: '#4752C4',
                contrastText: '#FFFFFF',
            },
            secondary: {
                main: '#43B581', // Darker green for better contrast (was #57F287)
                light: '#57F287',
                dark: '#3BA55D',
                contrastText: '#FFFFFF', // Changed from black for better contrast
            },
            error: {
                main: '#ED4245', // Discord red
                light: '#F04747',
                dark: '#C93B3E',
                contrastText: '#FFFFFF',
            },
            warning: {
                main: '#FAA61A', // Darker yellow/orange for better contrast (was #FEE75C)
                light: '#FEE75C',
                dark: '#E5971A',
                contrastText: '#000000',
            },
            info: {
                main: '#5865F2',
                light: '#7289DA',
                dark: '#4752C4',
                contrastText: '#FFFFFF',
            },
            success: {
                main: '#43B581', // Darker green for better contrast (was #57F287)
                light: '#57F287',
                dark: '#3BA55D',
                contrastText: '#FFFFFF',
            },
            background: {
                default: '#36393F', // Discord dark gray
                paper: '#2F3136', // Discord darker gray
            },
            text: {
                primary: '#DCDDDE', // Discord light gray text
                secondary: '#B9BBBE', // Discord muted text
                disabled: '#72767D',
            },
            divider: '#202225',
        },
        typography: {
            fontFamily: [
                'Whitney',
                '-apple-system',
                'BlinkMacSystemFont',
                'Segoe UI',
                'Roboto',
                'Helvetica',
                'Arial',
                'sans-serif',
            ].join(','),
            h1: {
                fontWeight: 700,
                fontSize: '2.5rem',
            },
            h2: {
                fontWeight: 700,
                fontSize: '2rem',
            },
            h3: {
                fontWeight: 600,
                fontSize: '1.75rem',
            },
            h4: {
                fontWeight: 600,
                fontSize: '1.5rem',
            },
            h5: {
                fontWeight: 600,
                fontSize: '1.25rem',
            },
            h6: {
                fontWeight: 600,
                fontSize: '1rem',
            },
            button: {
                textTransform: 'none',
                fontWeight: 500,
            },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                        padding: '8px 16px',
                        fontWeight: 500,
                    },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: '#2F3136',
                        borderRight: 'none',
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        margin: '2px 8px',
                        '&.Mui-selected': {
                            backgroundColor: '#404249',
                            '&:hover': {
                                backgroundColor: '#42464D',
                            },
                        },
                        '&:hover': {
                            backgroundColor: '#393C43',
                        },
                    },
                },
            },
            MuiListItemIcon: {
                styleOverrides: {
                    root: {
                        color: '#B9BBBE',
                        minWidth: 40,
                    },
                },
            },
            MuiListItemText: {
                styleOverrides: {
                    primary: {
                        fontWeight: 500,
                    },
                },
            },
        },
    });
    
    return (
        <ThemeProvider theme={theme}>
            <>
                <CssBaseline />
                {props.children}
            </>
        </ThemeProvider>
    );
}