import React, { ReactNode } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { SPACING, ICON_SIZE, OPACITY } from '../../constants/uiConstants';

interface EmptyStateProps {
    /** Icon to display (React element, typically from @mui/icons-material) */
    icon: ReactNode;
    /** Main title text */
    title: string;
    /** Optional description text */
    description?: string;
    /** Optional action button */
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'contained' | 'outlined' | 'text';
    };
    /** Optional secondary action */
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    /** Custom styles for the container */
    sx?: object;
}

/**
 * EmptyState component for displaying empty states throughout the application
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<CalendarMonthIcon />}
 *   title="No events scheduled"
 *   description="Create your first event to get started"
 *   action={{
 *     label: "Create Event",
 *     onClick: handleCreateEvent,
 *     variant: "contained"
 *   }}
 * />
 * ```
 */
export default function EmptyState({
    icon,
    title,
    description,
    action,
    secondaryAction,
    sx = {},
}: EmptyStateProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                py: SPACING.EXTRA_LARGE * 2,
                px: SPACING.MEDIUM,
                minHeight: 300,
                ...sx,
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    fontSize: ICON_SIZE.EXTRA_LARGE * 1.5,
                    color: 'text.disabled',
                    mb: SPACING.MEDIUM,
                    opacity: OPACITY.STRONG,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& > svg': {
                        fontSize: 'inherit',
                    },
                }}
            >
                {icon}
            </Box>

            {/* Title */}
            <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
                sx={{ fontWeight: 600, mb: SPACING.SMALL }}
            >
                {title}
            </Typography>

            {/* Description */}
            {description && (
                <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{
                        mb: action || secondaryAction ? SPACING.MEDIUM : 0,
                        maxWidth: 400,
                    }}
                >
                    {description}
                </Typography>
            )}

            {/* Actions */}
            {(action || secondaryAction) && (
                <Stack
                    direction="row"
                    spacing={SPACING.BUTTON_GAP * 2}
                    sx={{ mt: SPACING.MEDIUM }}
                >
                    {action && (
                        <Button
                            variant={action.variant || 'contained'}
                            onClick={action.onClick}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            variant="text"
                            onClick={secondaryAction.onClick}
                            sx={{ textTransform: 'none' }}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </Stack>
            )}
        </Box>
    );
}

/**
 * Specific empty state variants for common use cases
 */

interface SpecificEmptyStateProps {
    onAction?: () => void;
    onSecondaryAction?: () => void;
    customMessage?: string;
}

/**
 * Empty state for calendar with no events
 */
export function CalendarEmptyState({
    onAction,
    customMessage,
}: SpecificEmptyStateProps) {
    const CalendarIcon = () => (
        <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2z"/>
        </svg>
    );

    return (
        <EmptyState
            icon={<CalendarIcon />}
            title="No events scheduled"
            description={customMessage || "Your calendar is empty. Schedule a task to see it here."}
            action={
                onAction
                    ? {
                          label: 'Schedule Task',
                          onClick: onAction,
                          variant: 'contained',
                      }
                    : undefined
            }
        />
    );
}

/**
 * Empty state for tasks list
 */
export function TasksEmptyState({
    onAction,
    customMessage,
}: SpecificEmptyStateProps) {
    const TaskIcon = () => (
        <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
    );

    return (
        <EmptyState
            icon={<TaskIcon />}
            title="No tasks yet"
            description={customMessage || "Create your first task to get started with your project."}
            action={
                onAction
                    ? {
                          label: 'Create Task',
                          onClick: onAction,
                          variant: 'contained',
                      }
                    : undefined
            }
        />
    );
}

/**
 * Empty state for stories list
 */
export function StoriesEmptyState({
    onAction,
    customMessage,
}: SpecificEmptyStateProps) {
    const StoryIcon = () => (
        <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
    );

    return (
        <EmptyState
            icon={<StoryIcon />}
            title="No stories found"
            description={customMessage || "Stories help organize related tasks. Create one to begin."}
            action={
                onAction
                    ? {
                          label: 'Create Story',
                          onClick: onAction,
                          variant: 'contained',
                      }
                    : undefined
            }
        />
    );
}

/**
 * Empty state for search results
 */
export function SearchEmptyState({ customMessage }: { customMessage?: string }) {
    const SearchIcon = () => (
        <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
    );

    return (
        <EmptyState
            icon={<SearchIcon />}
            title="No results found"
            description={customMessage || "Try adjusting your search criteria or filters."}
        />
    );
}

/**
 * Empty state for errors
 */
export function ErrorEmptyState({
    onAction,
    customMessage,
}: SpecificEmptyStateProps) {
    const ErrorIcon = () => (
        <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
    );

    return (
        <EmptyState
            icon={<ErrorIcon />}
            title="Something went wrong"
            description={customMessage || "We couldn't load the content. Please try again."}
            action={
                onAction
                    ? {
                          label: 'Try Again',
                          onClick: onAction,
                          variant: 'outlined',
                      }
                    : undefined
            }
        />
    );
}

/**
 * Empty state for metrics/charts with no data
 */
export function MetricsEmptyState({
    onAction,
    customMessage,
}: SpecificEmptyStateProps) {
    const ChartIcon = () => (
        <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
    );

    return (
        <EmptyState
            icon={<ChartIcon />}
            title="No data available"
            description={customMessage || "Complete some tasks to see metrics and insights."}
            action={
                onAction
                    ? {
                          label: 'View Tasks',
                          onClick: onAction,
                          variant: 'outlined',
                      }
                    : undefined
            }
        />
    );
}
