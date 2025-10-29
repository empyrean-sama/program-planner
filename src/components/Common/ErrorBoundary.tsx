import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                        p: 3,
                    }}
                >
                    <Paper
                        sx={{
                            p: 4,
                            maxWidth: 600,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'error.main',
                        }}
                    >
                        <Stack spacing={2} alignItems="center">
                            <ErrorOutlineIcon
                                sx={{
                                    fontSize: 64,
                                    color: 'error.main',
                                }}
                            />
                            <Typography variant="h5" fontWeight={600}>
                                Something went wrong
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </Typography>
                            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        bgcolor: 'rgba(0,0,0,0.05)',
                                        borderRadius: 1,
                                        textAlign: 'left',
                                        width: '100%',
                                        maxHeight: '200px',
                                        overflow: 'auto',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        component="pre"
                                        sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                                    >
                                        {this.state.errorInfo.componentStack}
                                    </Typography>
                                </Box>
                            )}
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={this.handleReset}
                                sx={{ mt: 2 }}
                            >
                                Try Again
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook-based error fallback component for smaller sections
 */
export function ErrorFallback({
    error,
    resetError,
}: {
    error: Error;
    resetError?: () => void;
}) {
    return (
        <Box
            sx={{
                p: 3,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'error.light',
                borderRadius: 1,
                bgcolor: 'error.lighter',
            }}
        >
            <Stack spacing={2} alignItems="center">
                <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} />
                <Typography variant="body1" color="error.dark">
                    {error.message || 'Failed to load this section'}
                </Typography>
                {resetError && (
                    <Button size="small" onClick={resetError} startIcon={<RefreshIcon />}>
                        Retry
                    </Button>
                )}
            </Stack>
        </Box>
    );
}
