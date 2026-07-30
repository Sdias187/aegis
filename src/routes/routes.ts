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
  IMPORT_MASSIVO: '/import/massivo',
  LOGS: {
    EXECUTION: '/logs/execution',
  },
  MONITORING: '/monitoring',
  CONSULTA_LOGS: {
    GPS: '/consulta-logs/gps',
    VIVO_360: '/consulta-logs/vivo-360',
  },
  SERVICOS: {
    SIEBEL: '/servicos/siebel',
  },
} as const;
