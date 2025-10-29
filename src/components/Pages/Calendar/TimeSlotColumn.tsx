import React, { useState, useEffect, useRef } from 'react';
import { Box, useTheme, Tooltip, Typography, Paper, Alert, alpha } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useLocation } from 'react-router';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Task } from '../../../types/Task';
import {
    getTaskSchedulesForDate,
    getTaskDeadlinesForDate,
    calculateEventPosition,
    getTaskColor,
    formatTaskTimeRange,
    getDeadlineUrgency,
    getDeadlineColor,
    TaskCalendarEvent,
    layoutEvents,
} from './utils/calendarTaskUtils';

interface TimeSlotColumnProps {
    hours: number[];
    hourHeight: number;
    showBorderLeft?: boolean;
    day?: Dayjs;
    onContextMenu?: (event: React.MouseEvent, date: Dayjs, hour?: number, task?: Task, scheduleEntryId?: string) => void;
    currentView?: 'month' | 'week' | 'day';
    currentDate?: Dayjs;
    tasks: Task[]; // Receive tasks from parent
    onTasksUpdate?: () => void; // Callback to trigger parent refresh
}

export default function TimeSlotColumn({ 
    hours, 
    hourHeight,
    showBorderLeft = true,
    day,
    onContextMenu,
    currentView,
    currentDate,
    tasks,
    onTasksUpdate,
}: TimeSlotColumnProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [draggedEvent, setDraggedEvent] = useState<TaskCalendarEvent | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizingEvent, setResizingEvent] = useState<{ event: TaskCalendarEvent; type: 'top' | 'bottom' } | null>(null);
    const [resizeStart, setResizeStart] = useState<{ y: number; originalTop: number; originalHeight: number } | null>(null);
    const [resizePreview, setResizePreview] = useState<{ top: number; height: number } | null>(null);
    const currentMouseY = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Check if a task schedule violates deadline or estimate
    const checkScheduleWarnings = (event: TaskCalendarEvent): { hasWarning: boolean; warnings: string[] } => {
        const warnings: string[] = [];
        const task = event.task;

        // Check deadline violation
        if (task.dueDateTime) {
            const deadline = dayjs(task.dueDateTime);
            if (event.endTime.isAfter(deadline)) {
                warnings.push(`Ends after deadline (${deadline.format('MM/DD h:mm A')})`);
            }
        }

        // Check estimate violation
        if (task.estimatedTime) {
            const totalScheduledMinutes = task.scheduleHistory.reduce((sum, entry) => {
                const start = dayjs(entry.startTime);
                const end = dayjs(entry.endTime);
                return sum + end.diff(start, 'minute');
            }, 0);

            const estimatedMinutes = task.estimatedTime * 60; // Convert hours to minutes
            if (totalScheduledMinutes > estimatedMinutes) {
                const excess = ((totalScheduledMinutes - estimatedMinutes) / 60).toFixed(1);
                warnings.push(`Exceeds estimate by ${excess}h (est: ${task.estimatedTime}h)`);
            }
        }

        return { hasWarning: warnings.length > 0, warnings };
    };

    const scheduleEvents = day ? getTaskSchedulesForDate(tasks, day) : [];
    const deadlines = day ? getTaskDeadlinesForDate(tasks, day) : [];
    
    // Calculate layout for overlapping events
    const layoutedEvents = layoutEvents(scheduleEvents);

    const handleTaskContextMenu = (event: React.MouseEvent, task: Task, scheduleEntryId: string) => {
        event.preventDefault();
        event.stopPropagation();
        if (onContextMenu && day) {
            onContextMenu(event, day, undefined, task, scheduleEntryId);
        }
    };

    const handleDragStart = (event: React.DragEvent, calendarEvent: TaskCalendarEvent, position: { top: number }) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setDragOffset({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
        setDraggedEvent(calendarEvent);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', JSON.stringify({
            taskId: calendarEvent.task.id,
            entryId: calendarEvent.scheduleEntry.id,
            duration: calendarEvent.endTime.diff(calendarEvent.startTime, 'minute'),
        }));
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault();
        if (!day) return;

        const dragData = event.dataTransfer.getData('text/plain');
        if (!dragData) return;

        const { taskId, entryId, duration } = JSON.parse(dragData);

        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const dropY = event.clientY - rect.top - dragOffset.y;
        
        // Calculate new start time based on drop position
        const hourOffset = dropY / hourHeight;
        const dayStart = day.startOf('day');
        const newStartTime = dayStart.add(hourOffset, 'hour');
        const newEndTime = newStartTime.add(duration, 'minute');

        // Update the schedule entry
        try {
            await window.taskAPI.updateScheduleEntry({
                taskId,
                entryId,
                startTime: newStartTime.toISOString(),
                endTime: newEndTime.toISOString(),
            });
            
            // Clear dragged event state before reloading to prevent visual artifacts
            setDraggedEvent(null);
            
            // Trigger parent to refresh all columns
            if (onTasksUpdate) {
                await onTasksUpdate();
            }
        } catch (error) {
            console.error('Failed to update schedule entry:', error);
            setDraggedEvent(null);
        }
    };

    // Resizing handlers
    const handleResizeMouseDown = (event: React.MouseEvent, calendarEvent: TaskCalendarEvent, type: 'top' | 'bottom') => {
        event.preventDefault();
        event.stopPropagation();
        
        const position = calculateEventPosition(calendarEvent, day!, hourHeight);
        currentMouseY.current = event.clientY;
        setResizingEvent({ event: calendarEvent, type });
        setResizeStart({
            y: event.clientY,
            originalTop: position.top,
            originalHeight: position.height,
        });
    };

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (!resizingEvent || !resizeStart || !day) return;

            // Track current mouse position
            currentMouseY.current = event.clientY;

            // Calculate preview position and height
            const deltaY = event.clientY - resizeStart.y;
            const deltaHours = deltaY / hourHeight;

            let newStartTime = resizingEvent.event.startTime;
            let newEndTime = resizingEvent.event.endTime;
            let previewTop = resizeStart.originalTop;
            let previewHeight = resizeStart.originalHeight;

            if (resizingEvent.type === 'top') {
                // Resizing from top - adjust start time
                newStartTime = resizingEvent.event.startTime.add(deltaHours, 'hour');
                // Ensure minimum 15-minute duration
                if (newEndTime.diff(newStartTime, 'minute') < 15) {
                    newStartTime = newEndTime.subtract(15, 'minute');
                }
                
                // Calculate preview dimensions
                const dayStart = day.startOf('day');
                const startHour = newStartTime.diff(dayStart, 'minute') / 60;
                const duration = newEndTime.diff(newStartTime, 'minute') / 60;
                previewTop = startHour * hourHeight;
                previewHeight = Math.max(duration * hourHeight, 20);
            } else {
                // Resizing from bottom - adjust end time
                newEndTime = resizingEvent.event.endTime.add(deltaHours, 'hour');
                // Ensure minimum 15-minute duration
                if (newEndTime.diff(newStartTime, 'minute') < 15) {
                    newEndTime = newStartTime.add(15, 'minute');
                }
                
                // Calculate preview dimensions
                const duration = newEndTime.diff(newStartTime, 'minute') / 60;
                previewHeight = Math.max(duration * hourHeight, 20);
            }

            // Update preview
            setResizePreview({ top: previewTop, height: previewHeight });
        };

        const handleMouseUp = async () => {
            if (!resizingEvent || !resizeStart || !day) {
                setResizingEvent(null);
                setResizeStart(null);
                setResizePreview(null);
                return;
            }

            // Calculate the actual delta from start to current mouse position
            const deltaY = currentMouseY.current - resizeStart.y;
            const deltaHours = deltaY / hourHeight;

            let newStartTime = resizingEvent.event.startTime;
            let newEndTime = resizingEvent.event.endTime;

            if (resizingEvent.type === 'top') {
                // Resizing from top - adjust start time
                newStartTime = resizingEvent.event.startTime.add(deltaHours, 'hour');
                // Ensure minimum 15-minute duration
                if (newEndTime.diff(newStartTime, 'minute') < 15) {
                    newStartTime = newEndTime.subtract(15, 'minute');
                }
            } else {
                // Resizing from bottom - adjust end time
                newEndTime = resizingEvent.event.endTime.add(deltaHours, 'hour');
                // Ensure minimum 15-minute duration
                if (newEndTime.diff(newStartTime, 'minute') < 15) {
                    newEndTime = newStartTime.add(15, 'minute');
                }
            }

            // Update the schedule entry
            try {
                await window.taskAPI.updateScheduleEntry({
                    taskId: resizingEvent.event.task.id,
                    entryId: resizingEvent.event.scheduleEntry.id,
                    startTime: newStartTime.toISOString(),
                    endTime: newEndTime.toISOString(),
                });
                
                // Trigger parent to refresh all columns
                if (onTasksUpdate) {
                    await onTasksUpdate();
                }
            } catch (error) {
                console.error('Failed to resize schedule entry:', error);
            }

            setResizingEvent(null);
            setResizeStart(null);
            setResizePreview(null);
        };

        if (resizingEvent) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [resizingEvent, resizeStart, day, hourHeight, onTasksUpdate]);

    return (
        <Box
            sx={{
                flex: 1,
                position: 'relative',
                mx: showBorderLeft ? 0.5 : 0,
                borderLeft: showBorderLeft ? `2px solid ${theme.palette.divider}` : `1px solid ${theme.palette.divider}`,
                overflow: 'visible',
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Hour lines */}
            {hours.map((hour) => (
                <Box
                    key={hour}
                    onContextMenu={(e) => day && onContextMenu?.(e, day, hour)}
                    sx={{
                        position: 'absolute',
                        top: `${hour * hourHeight}px`,
                        left: 0,
                        right: 0,
                        height: `${hourHeight}px`,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        },
                    }}
                />
            ))}
            
            {/* Task schedule events */}
            {layoutedEvents.map((event: TaskCalendarEvent, index: number) => {
                const position = calculateEventPosition(event, day!, hourHeight);
                const taskColor = getTaskColor(event.task.state);
                const { hasWarning, warnings } = checkScheduleWarnings(event);
                const isBeingResized = resizingEvent?.event.scheduleEntry.id === event.scheduleEntry.id;
                
                // Calculate horizontal position based on column
                const columnWidth = event.totalColumns ? 100 / event.totalColumns : 100;
                const leftPercent = event.column !== undefined ? event.column * columnWidth : 0;

                return (
                    <Tooltip
                        key={`${event.task.id}-${event.scheduleEntry.id}`}
                        title={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {event.task.title}
                                </Typography>
                                <Typography variant="caption" display="block">
                                    {formatTaskTimeRange(event.startTime, event.endTime)}
                                </Typography>
                                <Typography variant="caption" display="block">
                                    State: {event.task.state}
                                </Typography>
                                {hasWarning && (
                                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                                        {warnings.map((warning, idx) => (
                                            <Typography 
                                                key={idx} 
                                                variant="caption" 
                                                display="block" 
                                                sx={{ color: '#ff9800', fontWeight: 600 }}
                                            >
                                                ⚠️ {warning}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        }
                        arrow
                    >
                        <Paper
                            elevation={2}
                            draggable
                            onDragStart={(e) => handleDragStart(e, event, position)}
                            onContextMenu={(e) => handleTaskContextMenu(e, event.task, event.scheduleEntry.id)}
                            sx={{
                                position: 'absolute',
                                top: `${position.top}px`,
                                left: `calc(${leftPercent}% + 2px)`,
                                width: `calc(${columnWidth}% - 4px)`,
                                height: `${position.height}px`,
                                backgroundColor: taskColor,
                                color: '#fff',
                                p: 0.5,
                                cursor: 'move',
                                overflow: 'visible',
                                borderTop: position.startsBeforeDay ? '2px dashed #fff' : 'none',
                                borderBottom: position.endsAfterDay ? '2px dashed #fff' : 'none',
                                border: hasWarning ? '2px solid #ff9800' : 'none',
                                boxShadow: hasWarning ? '0 0 8px rgba(255, 152, 0, 0.5)' : undefined,
                                opacity: isBeingResized ? 0.4 : 1,
                                transition: isBeingResized ? 'none' : 'opacity 0.2s',
                                '&:hover': {
                                    opacity: 0.8,
                                    zIndex: 10,
                                },
                                '&:hover .resize-handle': {
                                    opacity: 1,
                                },
                                zIndex: 5,
                            }}
                        >
                            {/* Top resize handle */}
                            <Box
                                className="resize-handle"
                                onMouseDown={(e) => handleResizeMouseDown(e, event, 'top')}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '6px',
                                    cursor: 'ns-resize',
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    zIndex: 10,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.5)',
                                    },
                                }}
                            />

                            {hasWarning && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        backgroundColor: '#ff9800',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        zIndex: 10,
                                    }}
                                >
                                    <WarningAmberIcon sx={{ fontSize: 14, color: '#fff' }} />
                                </Box>
                            )}

                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {event.task.title}
                            </Typography>
                            {position.height > 30 && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.6rem',
                                        display: 'block',
                                    }}
                                >
                                    {event.startTime.format('h:mm A')}
                                </Typography>
                            )}

                            {/* Bottom resize handle */}
                            <Box
                                className="resize-handle"
                                onMouseDown={(e) => handleResizeMouseDown(e, event, 'bottom')}
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '6px',
                                    cursor: 'ns-resize',
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    zIndex: 10,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.5)',
                                    },
                                }}
                            />
                        </Paper>
                    </Tooltip>
                );
            })}

            {/* Deadline indicators */}
            {deadlines.map((deadline, index) => {
                const { task, dueDateTime } = deadline;
                const urgency = getDeadlineUrgency(dueDateTime);
                const deadlineColor = getDeadlineColor(urgency);
                const minutesSinceMidnight = dueDateTime.hour() * 60 + dueDateTime.minute();
                const topPosition = (minutesSinceMidnight / 60) * hourHeight;

                return (
                    <Tooltip
                        key={`deadline-${task.id}-${index}`}
                        title={
                            <Box>
                                <Typography variant="body2" fontWeight="bold">
                                    {task.title}
                                </Typography>
                                <Typography variant="caption">
                                    Deadline: {dueDateTime.format('h:mm A')}
                                </Typography>
                            </Box>
                        }
                        placement="left"
                        arrow
                    >
                        <Box
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onContextMenu && day) {
                                    onContextMenu(e, day, undefined, task, undefined);
                                }
                            }}
                            sx={{
                                position: 'absolute',
                                top: `${topPosition}px`,
                                left: 0,
                                right: 0,
                                height: '2px',
                                backgroundColor: deadlineColor,
                                zIndex: 3,
                                cursor: 'context-menu',
                                pointerEvents: 'auto',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    right: -1,
                                    top: -4,
                                    width: 0,
                                    height: 0,
                                    borderTop: '5px solid transparent',
                                    borderBottom: '5px solid transparent',
                                    borderLeft: `8px solid ${deadlineColor}`,
                                },
                            }}
                        />
                    </Tooltip>
                );
            })}

            {/* Resize preview overlay */}
            {resizingEvent && resizePreview && (
                <>
                    {/* Preview box */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: `${resizePreview.top}px`,
                            left: '2px',
                            right: '2px',
                            height: `${resizePreview.height}px`,
                            backgroundColor: alpha(getTaskColor(resizingEvent.event.task.state), 0.3),
                            border: `2px dashed ${getTaskColor(resizingEvent.event.task.state)}`,
                            borderRadius: 1,
                            pointerEvents: 'none',
                            zIndex: 100,
                            transition: 'none',
                        }}
                    />
                    
                    {/* Top time indicator line (start time) - extends to time column */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: `${resizePreview.top - 1}px`,
                            left: '-500px',
                            right: '-200px',
                            height: '3px',
                            background: `repeating-linear-gradient(
                                to right,
                                ${getTaskColor(resizingEvent.event.task.state)} 0px,
                                ${getTaskColor(resizingEvent.event.task.state)} 10px,
                                transparent 10px,
                                transparent 20px
                            )`,
                            pointerEvents: 'none',
                            zIndex: 101,
                            transition: 'none',
                            boxShadow: `0 0 4px ${getTaskColor(resizingEvent.event.task.state)}`,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: '500px',
                                top: -5,
                                width: 0,
                                height: 0,
                                borderLeft: '6px solid transparent',
                                borderRight: '6px solid transparent',
                                borderTop: `7px solid ${getTaskColor(resizingEvent.event.task.state)}`,
                            },
                        }}
                    />
                    
                    {/* Start time label */}
                    {day && (() => {
                        const deltaY = currentMouseY.current - (resizeStart?.y || 0);
                        const deltaHours = deltaY / hourHeight;
                        let newStartTime = resizingEvent.event.startTime;
                        let newEndTime = resizingEvent.event.endTime;
                        
                        if (resizingEvent.type === 'top') {
                            newStartTime = resizingEvent.event.startTime.add(deltaHours, 'hour');
                            if (newEndTime.diff(newStartTime, 'minute') < 15) {
                                newStartTime = newEndTime.subtract(15, 'minute');
                            }
                        }
                        
                        return (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: `${resizePreview.top - 20}px`,
                                    left: '-85px',
                                    backgroundColor: getTaskColor(resizingEvent.event.task.state),
                                    color: '#fff',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    pointerEvents: 'none',
                                    zIndex: 102,
                                    whiteSpace: 'nowrap',
                                    boxShadow: 2,
                                }}
                            >
                                {newStartTime.format('h:mm A')}
                            </Box>
                        );
                    })()}
                    
                    {/* Bottom time indicator line (end time) - extends to time column */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: `${resizePreview.top + resizePreview.height - 1}px`,
                            left: '-500px',
                            right: '-200px',
                            height: '3px',
                            background: `repeating-linear-gradient(
                                to right,
                                ${getTaskColor(resizingEvent.event.task.state)} 0px,
                                ${getTaskColor(resizingEvent.event.task.state)} 10px,
                                transparent 10px,
                                transparent 20px
                            )`,
                            pointerEvents: 'none',
                            zIndex: 101,
                            transition: 'none',
                            boxShadow: `0 0 4px ${getTaskColor(resizingEvent.event.task.state)}`,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: '500px',
                                bottom: -5,
                                width: 0,
                                height: 0,
                                borderLeft: '6px solid transparent',
                                borderRight: '6px solid transparent',
                                borderBottom: `7px solid ${getTaskColor(resizingEvent.event.task.state)}`,
                            },
                        }}
                    />
                    
                    {/* End time label */}
                    {day && (() => {
                        const deltaY = currentMouseY.current - (resizeStart?.y || 0);
                        const deltaHours = deltaY / hourHeight;
                        let newStartTime = resizingEvent.event.startTime;
                        let newEndTime = resizingEvent.event.endTime;
                        
                        if (resizingEvent.type === 'bottom') {
                            newEndTime = resizingEvent.event.endTime.add(deltaHours, 'hour');
                            if (newEndTime.diff(newStartTime, 'minute') < 15) {
                                newEndTime = newStartTime.add(15, 'minute');
                            }
                        }
                        
                        return (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: `${resizePreview.top + resizePreview.height + 8}px`,
                                    left: '-85px',
                                    backgroundColor: getTaskColor(resizingEvent.event.task.state),
                                    color: '#fff',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    pointerEvents: 'none',
                                    zIndex: 102,
                                    whiteSpace: 'nowrap',
                                    boxShadow: 2,
                                }}
                            >
                                {newEndTime.format('h:mm A')}
                            </Box>
                        );
                    })()}
                </>
            )}
        </Box>
    );
}
