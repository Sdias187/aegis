import { PipeTransform, Injectable } from '@nestjs/common';
import type { PaginationParams } from '../interfaces';

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(query: Record<string, string>): PaginationParams {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    return {
      page,
      limit,
      search: query.search,
      atendimentoPara: query.atendimentoPara,
      servico: query.servico,
      ofertaServico: query.ofertaServico,
      detalheFalha: query.detalheFalha,
      categoria: query.categoria,
      subcategoria: query.subcategoria,
      nome: query.nome,
      descricao: query.descricao,
      endpoint: query.endpoint,
      metodo: query.metodo,
      active: query.active,
      sortBy: query.sortBy,
      sortOrder: (query.sortOrder as 'asc' | 'desc') || 'asc',
    };
  }
}
