import React, { createContext, useState, useCallback, useEffect } from "react";
import { Snackbar, Alert, AlertColor, Box, LinearProgress } from "@mui/material";
import IAppGlobalStateContextAPI, { ToastSeverity } from "../../interface/IAppGlobalStateContextAPI";

interface ToastState {
    id: number;
    message: string;
    severity: AlertColor;
    duration: number;
    startTime: number;
    exiting?: boolean;
}

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 2000; // 2 seconds

export const appGlobalStateContext = createContext<IAppGlobalStateContextAPI | null>(null);

export default function AppGlobalStateProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastState[]>([]);
    const [nextId, setNextId] = useState(0);

    const showToast = useCallback((message: string, severity: ToastSeverity = 'info', duration: number = DEFAULT_DURATION) => {
        const newToast: ToastState = {
            id: nextId,
            message,
            severity,
            duration,
            startTime: Date.now(),
        };

        setToasts(prev => {
            // If we're at max capacity, remove the oldest toast
            if (prev.length >= MAX_TOASTS) {
                return [...prev.slice(1), newToast];
            }
            return [...prev, newToast];
        });
        
        setNextId(prev => prev + 1);

        // Auto-remove toast after duration
        setTimeout(() => {
            removeToast(nextId);
        }, duration);
    }, [nextId]);

    const removeToast = useCallback((id: number) => {
        // First mark as exiting to trigger animation
        setToasts(prev => prev.map(toast => 
            toast.id === id ? { ...toast, exiting: true } : toast
        ));
        
        // Then remove from DOM after animation completes
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 300); // Match animation duration
    }, []);

    const contextValue: IAppGlobalStateContextAPI = {
        showToast,
    };

    return (
        <appGlobalStateContext.Provider value={contextValue}>
            {children}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: 1,
                    maxWidth: 400,
                }}
            >
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </Box>
        </appGlobalStateContext.Provider>
    )
}

// Toast Item Component with progress indicator
interface ToastItemProps {
    toast: ToastState;
    onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - toast.startTime;
            const newProgress = (elapsed / toast.duration) * 100;
            
            if (newProgress >= 100) {
                setProgress(100);
                clearInterval(interval);
            } else {
                setProgress(newProgress);
            }
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [toast.startTime, toast.duration]);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        onClose();
    };

    return (
        <Alert
            onClose={handleClose}
            severity={toast.severity}
            variant="filled"
            sx={{
                width: '100%',
                minWidth: '300px',
                boxShadow: 3,
                position: 'relative',
                overflow: 'hidden',
                animation: toast.exiting 
                    ? 'slideOut 0.3s ease-in forwards' 
                    : 'slideIn 0.3s ease-out',
                '@keyframes slideIn': {
                    from: {
                        transform: 'translateX(400px)',
                        opacity: 0,
                    },
                    to: {
                        transform: 'translateX(0)',
                        opacity: 1,
                    },
                },
                '@keyframes slideOut': {
                    from: {
                        transform: 'translateX(0)',
                        opacity: 1,
                        maxHeight: '100px',
                        marginBottom: '8px',
                    },
                    to: {
                        transform: 'translateX(400px)',
                        opacity: 0,
                        maxHeight: '0px',
                        marginBottom: '0px',
                        paddingTop: '0px',
                        paddingBottom: '0px',
                    },
                },
            }}
        >
            {toast.message}
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: 'transparent',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    },
                }}
            />
        </Alert>
    );
}