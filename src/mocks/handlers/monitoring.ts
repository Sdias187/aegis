import { http, HttpResponse } from 'msw';

export const monitoringHandlers = [
  http.get('/api/v1/monitoring/logs', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;

    return HttpResponse.json({
      data: Array.from({ length: 20 }, (_, i) => ({
        id: String((page - 1) * 20 + i + 1),
        serviceName: `service-${(i % 5) + 1}`,
        status: i % 4 === 0 ? 'error' : 'success',
        responseTime: Math.floor(Math.random() * 2000),
        correlationId: `corr-${(page - 1) * 20 + i + 1}`,
        createdAt: new Date().toISOString(),
      })),
      pagination: { page, limit: 20, total: 1000, totalPages: 50 },
    });
  }),

  http.get('/api/v1/monitoring/logs/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      serviceName: 'service-1',
      status: 'success',
      responseTime: 345,
      correlationId: 'corr-1',
      request: { method: 'POST', path: '/api/v1/fichas', body: {} },
      response: { status: 201, body: { id: '123' } },
      createdAt: new Date().toISOString(),
    });
  }),
];
