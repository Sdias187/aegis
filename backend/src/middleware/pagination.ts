import { Request, Response, NextFunction } from 'express';
import type { PaginationParams } from '../types/index.js';

export function parsePagination(req: Request, _res: Response, next: NextFunction): void {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const params: PaginationParams = {
    page,
    limit,
    search: req.query.search as string | undefined,
    atendimentoPara: req.query.atendimentoPara as string | undefined,
    servico: req.query.servico as string | undefined,
    ofertaServico: req.query.ofertaServico as string | undefined,
    detalheFalha: req.query.detalheFalha as string | undefined,
    categoria: req.query.categoria as string | undefined,
    subcategoria: req.query.subcategoria as string | undefined,
    nome: req.query.nome as string | undefined,
    descricao: req.query.descricao as string | undefined,
    endpoint: req.query.endpoint as string | undefined,
    metodo: req.query.metodo as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
  };

  req.pagination = params;
  next();
}

declare global {
  namespace Express {
    interface Request {
      pagination: PaginationParams;
    }
  }
}
