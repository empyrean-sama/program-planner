import React from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

export default function AppThemeProvider(props: React.PropsWithChildren) {
    const theme = createTheme({});
    return (
        <ThemeProvider theme={theme}>
            <>
                <CssBaseline />
                {props.children}
            </>
        </ThemeProvider>
    );
}