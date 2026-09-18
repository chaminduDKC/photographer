import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { lazy, Suspense } from 'react';
import { FullPageSpinner } from '../components/ui/Spinner';
import { LoginPage } from '../pages/LoginPage';

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const BusinessPage = lazy(() => import('../pages/BusinessPage').then((m) => ({ default: m.BusinessPage })));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const AlbumsPage = lazy(() => import('../pages/AlbumsPage').then((m) => ({ default: m.AlbumsPage })));
const CreateAlbumPage = lazy(() => import('../pages/CreateAlbumPage').then((m) => ({ default: m.CreateAlbumPage })));
const AlbumDetailPage = lazy(() => import('../pages/AlbumDetailPage').then((m) => ({ default: m.AlbumDetailPage })));
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })));


const Wrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/', element: <Wrap><DashboardPage /></Wrap> },
          { path: '/business', element: <Wrap><BusinessPage /></Wrap> },
          { path: '/categories', element: <Wrap><CategoriesPage /></Wrap> },
          { path: '/albums', element: <Wrap><AlbumsPage /></Wrap> },
          { path: '/albums/new', element: <Wrap><CreateAlbumPage /></Wrap> },
          { path: '/albums/:id', element: <Wrap><AlbumDetailPage /></Wrap> },
          { path: '/settings/password', element: <Wrap><ChangePasswordPage /></Wrap> },
        ],
      },
    ],
  },
]);
