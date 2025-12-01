import { Router } from 'express';
import { patientController } from './patient.controller';

const router = Router();

// POST /api/patients - Create new patient
router.post('/', patientController.create);

// GET /api/patients - Get all patients
router.get('/', patientController.findAll);

// GET /api/patients/:id - Get patient by ID
router.get('/:id', patientController.findById);

// GET /api/patients/phone/:phone - Get patient by phone
router.get('/phone/:phone', patientController.findByPhone);

// PUT /api/patients/:id - Update patient
router.put('/:id', patientController.update);

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', patientController.delete);

export default router;
