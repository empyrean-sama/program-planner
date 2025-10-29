import { Box, Skeleton, Stack, Paper } from '@mui/material';

/**
 * Skeleton loader for task cards
 */
export function TaskCardSkeleton() {
    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                breakInside: 'avoid',
            }}
        >
            <Stack spacing={1.5}>
                {/* Title */}
                <Skeleton variant="text" width="80%" height={28} />
                
                {/* Description */}
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="90%" height={20} />
                
                {/* Tags/chips */}
                <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                </Stack>
                
                {/* Date info */}
                <Skeleton variant="text" width="60%" height={18} />
            </Stack>
        </Paper>
    );
}

/**
 * Grid of task card skeletons
 */
export function TaskCardGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <Box
            sx={{
                columnCount: { xs: 1, sm: 2, md: 3, lg: 4 },
                columnGap: 3,
            }}
        >
            {Array.from({ length: count }).map((_, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                    <TaskCardSkeleton />
                </Box>
            ))}
        </Box>
    );
}

/**
 * Skeleton for stat cards in metrics page
 */
export function StatCardSkeleton() {
    return (
        <Paper
            sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="circular" width={40} height={40} />
                </Stack>
                <Skeleton variant="text" width="50%" height={36} />
                <Skeleton variant="text" width="70%" height={18} />
            </Stack>
        </Paper>
    );
}

/**
 * Skeleton for charts
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
            }}
        >
            <Stack spacing={2}>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: 1 }} />
            </Stack>
        </Paper>
    );
}

/**
 * Skeleton for calendar view
 */
export function CalendarSkeleton({ view = 'month' }: { view?: 'month' | 'week' | 'day' }) {
    const columns = view === 'month' ? 7 : view === 'week' ? 7 : 1;
    const rows = view === 'month' ? 5 : view === 'week' ? 1 : 24;
    
    return (
        <Box sx={{ p: 2 }}>
            {/* Header */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Box sx={{ flex: 1 }} />
                <Skeleton variant="rounded" width={100} height={36} />
                <Skeleton variant="rounded" width={100} height={36} />
            </Stack>
            
            {/* Calendar grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: 1,
                }}
            >
                {Array.from({ length: columns * rows }).map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rectangular"
                        height={view === 'month' ? 100 : view === 'week' ? 500 : 40}
                        sx={{ borderRadius: 1 }}
                    />
                ))}
            </Box>
        </Box>
    );
}

/**
 * Full page skeleton for task details
 */
export function TaskDetailsSkeleton() {
    return (
        <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
                {/* Back button and title */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={300} height={40} />
                </Stack>
                
                {/* Main content */}
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Stack spacing={3}>
                        <Skeleton variant="text" width="100%" height={32} />
                        <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
                        
                        <Stack direction="row" spacing={2}>
                            <Skeleton variant="rounded" width={120} height={80} />
                            <Skeleton variant="rounded" width={120} height={80} />
                            <Skeleton variant="rounded" width={120} height={80} />
                        </Stack>
                        
                        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}
