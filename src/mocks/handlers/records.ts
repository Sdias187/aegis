import { http, HttpResponse } from 'msw';

const pessoas = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Pedro Souza'];
const servicos = ['Suporte Técnico', 'Infraestrutura', 'Rede', 'Aplicação', 'Segurança'];
const ofertas = ['Básico', 'Premium', 'Enterprise', 'Gov', 'Educação'];
const categorias = ['Segurança', 'Infraestrutura', 'Aplicação', 'Rede', 'Banco de Dados'];
const subcategorias = ['Autenticação', 'Conectividade', 'API', 'Banco', 'Acesso'];

function generateRecords(page: number, limit: number) {
  return Array.from({ length: limit }, (_, i) => {
    const index = (page - 1) * limit + i + 1;
    return {
      id: String(index),
      atendimentoPara: pessoas[index % pessoas.length]!,
      servico: servicos[index % servicos.length]!,
      ofertaServico: ofertas[index % ofertas.length]!,
      detalheFalha: `Falha detectada no módulo ${servicos[index % servicos.length]!.toLowerCase()} — incidente #${index}`,
      categoria: categorias[index % categorias.length]!,
      subcategoria: subcategorias[index % subcategorias.length]!,
    };
  });
}

export const recordsHandlers = [
  http.get('/api/v1/fichas', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 20;
    const search = url.searchParams.get('search')?.toLowerCase();

    let data = generateRecords(page, limit);

    if (search) {
      data = data.filter((r) =>
        r.atendimentoPara.toLowerCase().includes(search) ||
        r.servico.toLowerCase().includes(search) ||
        (r.detalheFalha ?? '').toLowerCase().includes(search),
      );
    }

    return HttpResponse.json({
      data,
      pagination: { page, limit, total: 1250, totalPages: Math.ceil(1250 / limit) },
    });
  }),

  http.get('/api/v1/fichas/:id', ({ params }) => {
    const idx = Number(params.id) % pessoas.length;
    return HttpResponse.json({
      id: params.id,
      atendimentoPara: pessoas[idx]!,
      servico: servicos[idx]!,
      ofertaServico: 'Premium',
      detalheFalha: 'Falha no módulo de autenticação conforme log do sistema.',
      categoria: 'Segurança',
      subcategoria: 'Autenticação',
    });
  }),

  http.post('/api/v1/fichas', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: String(Math.floor(Math.random() * 10000)), ...(body as object) }, { status: 201 });
  }),

  http.put('/api/v1/fichas/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...(body as object) });
  }),

  http.delete('/api/v1/fichas/:id', () => {
    return HttpResponse.json({ message: 'Ficha excluída com sucesso' });
  }),
];
