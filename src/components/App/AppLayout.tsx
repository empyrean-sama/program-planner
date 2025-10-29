import { lazy, Suspense } from 'react';
import { createHashRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { Box, CircularProgress } from '@mui/material';

import PageEnclosure from '../Pages/PageEnclosure';
import NotFoundErrorPage from '../Pages/Error/NotFoundErrorPage';
import HomePage from '../Pages/Home/HomePage';

// Lazy load heavy pages for better initial load performance
const CalendarPage = lazy(() => import('../Pages/Calendar/CalendarPage'));
const TasksPage = lazy(() => import('../Pages/Tasks/TasksPage'));
const TaskDetailsPage = lazy(() => import('../Pages/Tasks/TaskDetailsPage'));
const MetricsPage = lazy(() => import('../Pages/Metrics/MetricsPage'));
const SettingsPage = lazy(() => import('../Pages/Settings/SettingsPage'));
const StoriesPage = lazy(() => import('../Pages/Stories/StoriesPage'));
const StoryDetailsPage = lazy(() => import('../Pages/Stories/StoryDetailsPage'));
const StoryMetricsPage = lazy(() => import('../Pages/Stories/StoryMetricsPage'));

// Loading fallback component
function PageLoader() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
            }}
        >
            <CircularProgress />
        </Box>
    );
}

export default function AppLayout() {
    const router = createHashRouter(createRoutesFromElements(
        <Route path="/" element={<PageEnclosure />}>
            <Route index element={<HomePage />} />
            <Route path="calendar" element={
                <Suspense fallback={<PageLoader />}>
                    <CalendarPage />
                </Suspense>
            } />
            <Route path="tasks" element={
                <Suspense fallback={<PageLoader />}>
                    <TasksPage />
                </Suspense>
            } />
            <Route path="tasks/:taskId" element={
                <Suspense fallback={<PageLoader />}>
                    <TaskDetailsPage />
                </Suspense>
            } />
            <Route path="stories" element={
                <Suspense fallback={<PageLoader />}>
                    <StoriesPage />
                </Suspense>
            } />
            <Route path="stories/:id" element={
                <Suspense fallback={<PageLoader />}>
                    <StoryDetailsPage />
                </Suspense>
            } />
            <Route path="stories/:id/metrics" element={
                <Suspense fallback={<PageLoader />}>
                    <StoryMetricsPage />
                </Suspense>
            } />
            <Route path="metrics" element={
                <Suspense fallback={<PageLoader />}>
                    <MetricsPage />
                </Suspense>
            } />
            <Route path="settings" element={
                <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                </Suspense>
            } />
            <Route path="*" element={<NotFoundErrorPage />} />
        </Route>
    ));

    return (
        <RouterProvider router={router} />
    );
}