import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { ROUTES } from './routes';
import {
  LazyDashboard,
  LazyRecords,
  LazyRecordCreate,
  LazyRecordEdit,
  LazyLocks,
  LazyImport,
  LazyExecutionLogs,
  LazyMonitoring,
} from './lazy-routes';

const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <LazyDashboard /> },
      { path: ROUTES.RECORDS.LIST, element: <LazyRecords /> },
      { path: ROUTES.RECORDS.NEW, element: <LazyRecordCreate /> },
      { path: ROUTES.RECORDS.EDIT, element: <LazyRecordEdit /> },
      { path: ROUTES.LOCKS.LIST, element: <LazyLocks /> },
      { path: ROUTES.IMPORT, element: <LazyImport /> },
      { path: ROUTES.LOGS.EXECUTION, element: <LazyExecutionLogs /> },
      { path: ROUTES.MONITORING, element: <LazyMonitoring /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
export { ROUTES };
