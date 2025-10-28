import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

export interface TextBubbleProps {
    title: string,
    content: string,
}

export default function TextBubble({ title, content }: TextBubbleProps) {
    const theme = useTheme();    
    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
            }}
        >
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                {content}
            </Typography>
        </Paper>
    )
}