import { http, HttpResponse } from 'msw';

const now = new Date();

/*
 * Schema real:
 *   NOME, DESCRICAO, ENDPOINT, METODO, ATIVO
 */
const travasMock = [
  { nome: 'Login Legado', descricao: 'Trava de segurança para login do sistema legado', endpoint: '/api/v2/login', metodo: 'POST' },
  { nome: 'Pagamentos', descricao: 'Bloqueio preventivo de processamento de pagamentos', endpoint: '/checkout', metodo: 'POST' },
  { nome: 'Notificações Push', descricao: 'Gateway de notificações em manutenção', endpoint: '/push', metodo: 'POST' },
  { nome: 'Ingestão de Logs', descricao: 'Serviço de logs centralizado sobrecarregado', endpoint: '/ingest', metodo: 'POST' },
  { nome: 'Health Check LB', descricao: 'Balanceador de carga em manutenção', endpoint: '/health', metodo: 'GET' },
  { nome: 'Proxy Reverso', descricao: 'Atualização de configuração do proxy', endpoint: '/api', metodo: 'GET' },
  { nome: 'Cache Distribuído', descricao: 'Limpeza de cache programada', endpoint: '/keys', metodo: 'DELETE' },
  { nome: 'Consulta Direta BD', descricao: 'Restrição de consultas diretas ao banco', endpoint: '/query', metodo: 'SELECT' },
  { nome: 'Exportação Relatórios', descricao: 'Módulo de relatórios em atualização', endpoint: '/export', metodo: 'GET' },
  { nome: 'Upload Arquivos', descricao: 'API de importação temporariamente desativada', endpoint: '/upload', metodo: 'POST' },
  { nome: 'Autenticação LDAP', descricao: 'Revisão de segurança no LDAP', endpoint: '/ldap/auth', metodo: 'POST' },
  { nome: 'API de Clientes', descricao: 'Manutenção na API de clientes', endpoint: '/clientes/v1/dados', metodo: 'GET' },
  { nome: 'Gateway SMS', descricao: 'Restrição no gateway de SMS', endpoint: '/sms/enviar', metodo: 'POST' },
  { nome: 'Portal Fornecedor', descricao: 'Bloqueio de acesso ao portal', endpoint: '/fornecedor/login', metodo: 'POST' },
  { nome: 'Fila de Processamento', descricao: 'Sobrecarga na fila de mensageria', endpoint: '/queue/publish', metodo: 'POST' },
  { nome: 'Backup Automático', descricao: 'Janela de backup em andamento', endpoint: '/backup/run', metodo: 'POST' },
  { nome: 'Sistema de Tickets', descricao: 'API de tickets temporariamente restrita', endpoint: '/tickets/open', metodo: 'POST' },
  { nome: 'Auditoria', descricao: 'Base de auditoria em manutenção', endpoint: '/audit/events', metodo: 'GET' },
  { nome: 'Monitoramento', descricao: 'Limite de requisições ao monitor', endpoint: '/monitor/status', metodo: 'GET' },
  { nome: 'Serviço de Email', descricao: 'Serviço de email com restrição', endpoint: '/mail/send', metodo: 'POST' },
];

export const locksHandlers = [
  http.get('/api/v1/travas', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const search = url.searchParams.get('search')?.toLowerCase();
    const nome = url.searchParams.get('nome')?.toLowerCase();
    const endpoint = url.searchParams.get('endpoint')?.toLowerCase();

    let data = travasMock.map((t, i) => {
      const index = (page - 1) * 20 + i + 1;
      const isActive = i < 15;
      return {
        id: String(index),
        nome: t.nome,
        descricao: t.descricao,
        endpoint: t.endpoint,
        metodo: t.metodo,
        ativo: isActive,
        dataCriacao: new Date(now.getTime() - index * 86400000).toISOString(),
        dataDesativacao: isActive ? undefined : new Date(now.getTime() - index * 3600000).toISOString(),
      };
    });

    if (search) {
      data = data.filter((r) =>
        r.nome.toLowerCase().includes(search) ||
        r.descricao.toLowerCase().includes(search) ||
        r.endpoint.toLowerCase().includes(search) ||
        r.metodo.toLowerCase().includes(search),
      );
    }
    if (nome) {
      data = data.filter((r) => r.nome.toLowerCase().includes(nome));
    }
    if (endpoint) {
      data = data.filter((r) => r.endpoint.toLowerCase().includes(endpoint));
    }

    return HttpResponse.json({
      data,
      pagination: { page, limit: 20, total: 125, totalPages: 7 },
    });
  }),

  http.get('/api/v1/travas/:id', ({ params }) => {
    const idx = (Number(params.id) - 1) % travasMock.length;
    const t = travasMock[idx] as (typeof travasMock)[number];
    return HttpResponse.json({
      id: params.id,
      nome: t.nome,
      descricao: t.descricao,
      endpoint: t.endpoint,
      metodo: t.metodo,
      ativo: true,
      dataCriacao: now.toISOString(),
    });
  }),

  http.post('/api/v1/travas/:id/disable', async () => {
    return HttpResponse.json({ message: 'Trava desativada com sucesso' });
  }),
];
