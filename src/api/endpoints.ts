// NOTA: o prefixo /api/v1 já está configurado no VITE_API_URL
// Os endpoints aqui são apenas o path relativo

export const API_ENDPOINTS = {
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
    HEALTH: '/dashboard/health',
    EXTERNAL_HEALTH: '/dashboard/external-health',
  },
  FICHAS: {
    LIST: '/fichas',
    DETAILS: (id: string) => `/fichas/${id}`,
    CREATE: '/fichas',
    UPDATE: (id: string) => `/fichas/${id}`,
    DELETE: (id: string) => `/fichas/${id}`,
  },
  TRAVAS: {
    LIST: '/travas',
    DETAILS: (id: string) => `/travas/${id}`,
    DISABLE: (id: string) => `/travas/${id}/disable`,
  },
  IMPORT: {
    UPLOAD: '/import/upload',
    STATUS: (id: string) => `/import/${id}/status`,
    REPORT: (id: string) => `/import/${id}/report`,
    HISTORY: '/import/history',
  },
  IMPORT_MASSIVO: {
    PREVIEW: '/import-massivo/preview',
    EXECUTE: (sessionId: string) => `/import-massivo/execute/${sessionId}`,
    STATUS: (sessionId: string) => `/import-massivo/status/${sessionId}`,
    MODELO: '/import-massivo/modelo',
  },
  LOGS: {
    EXECUTION: '/logs/execucao',
    EXECUTION_DETAILS: (id: string) => `/logs/execucao/${id}`,
  },
  MONITORING: {
    LOGS: '/monitoring/logs',
    DETAILS: (id: string) => `/monitoring/logs/${id}`,
  },
} as const;
