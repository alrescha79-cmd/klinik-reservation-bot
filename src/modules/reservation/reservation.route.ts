import { Router } from 'express';
import { reservationController } from './reservation.controller';

const router = Router();

// POST /api/reservations - Create new reservation
router.post('/', reservationController.create);

// GET /api/reservations - Get all reservations
router.get('/', reservationController.findAll);

// GET /api/reservations/today - Get today's reservations
router.get('/today', reservationController.findToday);

// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', reservationController.findById);

// GET /api/reservations/patient/:patientId - Get reservations by patient
router.get('/patient/:patientId', reservationController.findByPatient);

// GET /api/reservations/doctor/:doctorId - Get reservations by doctor
router.get('/doctor/:doctorId', reservationController.findByDoctor);

// GET /api/reservations/date/:date - Get reservations by date
router.get('/date/:date', reservationController.findByDate);

// GET /api/reservations/doctor/:doctorId/date/:date - Get reservations by doctor and date
router.get('/doctor/:doctorId/date/:date', reservationController.findByDoctorAndDate);

// GET /api/reservations/stats/:doctorId/:date - Get queue statistics
router.get('/stats/:doctorId/:date', reservationController.getQueueStats);

// PUT /api/reservations/:id/confirm - Confirm reservation
router.put('/:id/confirm', reservationController.confirm);

// PUT /api/reservations/:id/complete - Complete reservation
router.put('/:id/complete', reservationController.complete);

// PUT /api/reservations/:id/cancel - Cancel reservation
router.put('/:id/cancel', reservationController.cancel);

// PUT /api/reservations/:id/reschedule - Reschedule reservation
router.put('/:id/reschedule', reservationController.reschedule);

// DELETE /api/reservations/:id - Delete reservation
router.delete('/:id', reservationController.delete);

export default router;
