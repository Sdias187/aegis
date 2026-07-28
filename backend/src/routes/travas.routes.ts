import { Router } from 'express';
import { travasController } from '../controllers/travas.controller.js';

const router = Router();

router.get('/', travasController.list);
router.get('/:id', travasController.getById);

export default router;
