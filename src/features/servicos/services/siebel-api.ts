import type { SiebelService, SiebelListParams } from '../types/siebel.types';
import type { PaginatedResponse } from '@/types';

const MOCK_SIEBEL_SERVICES: SiebelService[] = [
  {
    id: '1',
    serviceName: 'Consulta Cliente',
    serviceType: 'Consulta',
    status: 'ATIVO',
    endpoint: '/api/siebel/client/{id}',
    lastSync: new Date().toISOString(),
  },
  {
    id: '2',
    serviceName: 'Criação de Ordem',
    serviceType: 'CRUD',
    status: 'ATIVO',
    endpoint: '/api/siebel/order',
    lastSync: new Date().toISOString(),
  },
  {
    id: '3',
    serviceName: 'Consulta Fatura',
    serviceType: 'Consulta',
    status: 'ERRO',
    endpoint: '/api/siebel/invoice/{id}',
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    errorMessage: 'Timeout na conexão com Siebel',
  },
  {
    id: '4',
    serviceName: 'Atualização de Plano',
    serviceType: 'CRUD',
    status: 'ATIVO',
    endpoint: '/api/siebel/plan/{id}',
    lastSync: new Date().toISOString(),
  },
  {
    id: '5',
    serviceName: 'Relatório de Uso',
    serviceType: 'Relatório',
    status: 'INATIVO',
    endpoint: '/api/siebel/report/usage',
    lastSync: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const siebelApi = {
  async list(params: SiebelListParams): Promise<PaginatedResponse<SiebelService>> {
    let filtered = [...MOCK_SIEBEL_SERVICES];

    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (svc) =>
          svc.serviceName.toLowerCase().includes(s) ||
          svc.serviceType.toLowerCase().includes(s) ||
          svc.endpoint.toLowerCase().includes(s),
      );
    }

    if (params.status) {
      filtered = filtered.filter((svc) => svc.status === params.status);
    }

    if (params.serviceType) {
      filtered = filtered.filter((svc) => svc.serviceType === params.serviceType);
    }

    const total = filtered.length;
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);

    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },
};
