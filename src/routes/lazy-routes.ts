import { lazy } from 'react';

export const LazyDashboard = lazy(() => import('@/features/dashboard/components/dashboard-page'));
export const LazyRecords = lazy(() => import('@/features/records/components/records-page'));
export const LazyRecordCreate = lazy(() => import('@/features/records/components/record-create-page'));
export const LazyRecordEdit = lazy(() => import('@/features/records/components/record-edit-page'));
export const LazyLocks = lazy(() => import('@/features/locks/components/locks-page'));
export const LazyImport = lazy(() => import('@/features/import/components/import-page'));
export const LazyExecutionLogs = lazy(() => import('@/features/execution-logs/components/execution-logs-page'));
export const LazyMonitoring = lazy(() => import('@/features/monitoring/components/monitoring-page'));
export const LazyGps = lazy(() => import('@/features/consulta-logs/components/gps-page'));
export const LazyVivo360 = lazy(() => import('@/features/consulta-logs/components/vivo-360-page'));
export const LazySiebel = lazy(() => import('@/features/servicos/components/siebel-page'));
export const LazyImportMassivo = lazy(() => import('@/features/import-massivo/components/import-massivo-page'));
export const LazyBadlist = lazy(() => import('@/features/badlist/components/badlist-page'));
