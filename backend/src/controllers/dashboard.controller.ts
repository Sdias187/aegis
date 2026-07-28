import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { logger } from '../config/logger.js';

export const dashboardController = {
  async summary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getSummary();
      res.json(data);
    } catch (err) {
      logger.error('[DashboardController] Error summary', err as Error);
      next(err);
    }
  },

  async health(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getHealth();
      res.json(data);
    } catch (err) {
      logger.error('[DashboardController] Error health', err as Error);
      next(err);
    }
  },
};
