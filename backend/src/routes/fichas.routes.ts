import { Router } from 'express';
import { fichasController } from '../controllers/fichas.controller.js';

const router = Router();

router.get('/', fichasController.list);
router.get('/:id', fichasController.getById);

export default router;
