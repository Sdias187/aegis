import { Request, Response, NextFunction } from 'express';
import { fichasService } from '../services/fichas.service.js';
import { logger } from '../config/logger.js';

export const fichasController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await fichasService.list(req.pagination);
      res.json(result);
    } catch (err) {
      logger.error('[FichasController] Error listing', err as Error);
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const ficha = await fichasService.getById(id);

      if (!ficha) {
        res.status(404).json({ type: 'NOT_FOUND', message: 'Ficha não encontrada' });
        return;
      }

      res.json(ficha);
    } catch (err) {
      logger.error('[FichasController] Error getById', err as Error);
      next(err);
    }
  },
};
