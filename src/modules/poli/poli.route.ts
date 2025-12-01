import { Router } from 'express';
import { poliController } from './poli.controller';

const router = Router();

// Seed route (should be protected in production)
router.post('/seed', poliController.seed);

// CRUD routes
router.post('/', poliController.create);
router.get('/', poliController.findAll);
router.get('/:id', poliController.findById);
router.put('/:id', poliController.update);
router.delete('/:id', poliController.delete);

// Schedule route
router.get('/:id/schedule/:day', poliController.getScheduleForDay);

export default router;
