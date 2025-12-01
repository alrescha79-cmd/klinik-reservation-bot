import { Router } from 'express';
import { doctorController } from './doctor.controller';

const router = Router();

// POST /api/doctors - Create new doctor
router.post('/', doctorController.create);

// POST /api/doctors/seed - Seed initial doctors
router.post('/seed', doctorController.seed);

// GET /api/doctors - Get all doctors
router.get('/', doctorController.findAll);

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', doctorController.findById);

// GET /api/doctors/specialty/:specialty - Get doctors by specialty
router.get('/specialty/:specialty', doctorController.findBySpecialty);

// GET /api/doctors/:id/schedule/:day - Get doctor schedule for a specific day
router.get('/:id/schedule/:day', doctorController.getScheduleForDay);

// PUT /api/doctors/:id - Update doctor
router.put('/:id', doctorController.update);

// DELETE /api/doctors/:id - Delete doctor
router.delete('/:id', doctorController.delete);

export default router;
