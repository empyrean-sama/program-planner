import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';

import PageEnclosure from '../Pages/PageEnclosure';
import NotFoundErrorPage from '../Pages/Error/NotFoundErrorPage';
import HomePage from '../Pages/Home/HomePage';

export default function AppLayout() {
    const router = createBrowserRouter(createRoutesFromElements(
        <Route path="/" element={<PageEnclosure />}>
            <Route index element={<HomePage />} />
            <Route path="*" element={<NotFoundErrorPage />} />
        </Route>
    ));

    return (
        <RouterProvider router={router} />
    );
}