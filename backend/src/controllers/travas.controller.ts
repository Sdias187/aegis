import { Request, Response, NextFunction } from 'express';
import { travasService } from '../services/travas.service.js';
import { logger } from '../config/logger.js';

export const travasController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await travasService.list(req.pagination);
      res.json(result);
    } catch (err) {
      logger.error('[TravasController] Error listing', err as Error);
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const trava = await travasService.getById(id);

      if (!trava) {
        res.status(404).json({ type: 'NOT_FOUND', message: 'Trava não encontrada' });
        return;
      }

      res.json(trava);
    } catch (err) {
      logger.error('[TravasController] Error getById', err as Error);
      next(err);
    }
  },
};
