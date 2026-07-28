import { Router } from 'express';
import fichasRoutes from './fichas.routes.js';
import travasRoutes from './travas.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import { parsePagination } from '../middleware/pagination.js';

const router = Router();

router.use('/fichas', parsePagination, fichasRoutes);
router.use('/travas', parsePagination, travasRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', dashboardRoutes);

export default router;
