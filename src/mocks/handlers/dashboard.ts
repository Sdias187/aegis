import { http, HttpResponse } from 'msw';

const now = new Date();

export const dashboardHandlers = [
  http.get('/api/v1/dashboard/summary', () => {
    return HttpResponse.json({
      totalRecords: 1250,
      activeLocks: 34,
      disabledLocks: 128,
      totalImports: 89,
      successfulImports: 82,
      failedImports: 7,
    });
  }),

  http.get('/api/v1/dashboard/recent-activity', () => {
    return HttpResponse.json({
      data: [
        { id: '1', type: 'import', description: 'Importação de fichas concluída — 150 registros processados', timestamp: new Date(now.getTime() - 5 * 60000).toISOString() },
        { id: '2', type: 'lock', description: 'Trava #123 desativada por usuário admin', timestamp: new Date(now.getTime() - 15 * 60000).toISOString() },
        { id: '3', type: 'record', description: 'Ficha #456 criada — Incidente de segurança', timestamp: new Date(now.getTime() - 30 * 60000).toISOString() },
        { id: '4', type: 'import', description: 'Importação de fichas falhou — arquivo inválido', timestamp: new Date(now.getTime() - 60 * 60000).toISOString() },
        { id: '5', type: 'monitoring', description: 'Serviço externo "Sentry" executado com sucesso', timestamp: new Date(now.getTime() - 120 * 60000).toISOString() },
      ],
    });
  }),

  http.get('/api/v1/dashboard/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      uptime: 86400,
      lastCheck: now.toISOString(),
    });
  }),
];
