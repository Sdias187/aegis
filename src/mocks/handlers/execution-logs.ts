import { http, HttpResponse } from 'msw';

export const executionLogsHandlers = [
  http.get('/api/v1/logs/execucao', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;

    return HttpResponse.json({
      data: Array.from({ length: 20 }, (_, i) => ({
        id: String((page - 1) * 20 + i + 1),
        status: i % 4 === 0 ? 'error' : 'success',
        duration: Math.floor(Math.random() * 5000),
        lockType: i % 2 === 0 ? 'preventivo' : 'reativo',
        message: `Execução ${(page - 1) * 20 + i + 1}`,
        createdAt: new Date().toISOString(),
      })),
      pagination: { page, limit: 20, total: 500, totalPages: 25 },
    });
  }),

  http.get('/api/v1/logs/execucao/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'success',
      duration: 2340,
      lockType: 'preventivo',
      message: 'Execução concluída com sucesso',
      details: { processed: 150, errors: 0 },
      createdAt: new Date().toISOString(),
    });
  }),
];
