export const ROUTES = {
  DASHBOARD: '/',
  RECORDS: {
    LIST: '/records',
    NEW: '/records/new',
    EDIT: '/records/:id/edit',
  },
  LOCKS: {
    LIST: '/locks',
  },
  IMPORT: '/import',
  LOGS: {
    EXECUTION: '/logs/execution',
  },
  MONITORING: '/monitoring',
} as const;
