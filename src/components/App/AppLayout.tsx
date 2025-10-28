import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';

import PageEnclosure from '../Pages/PageEnclosure';
import NotFoundErrorPage from '../Pages/Error/NotFoundErrorPage';
import HomePage from '../Pages/Home/HomePage';
import CalendarPage from '../Pages/Calendar/CalendarPage';
import TasksPage from '../Pages/Tasks/TasksPage';

export default function AppLayout() {
    const router = createBrowserRouter(createRoutesFromElements(
        <Route path="/" element={<PageEnclosure />}>
            <Route index element={<HomePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="*" element={<NotFoundErrorPage />} />
        </Route>
    ));

    return (
        <RouterProvider router={router} />
    );
}