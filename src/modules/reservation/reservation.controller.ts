import { Request, Response, NextFunction } from 'express';
import { reservationService } from './reservation.service';
import logger from '../../utils/logger';

export const reservationController = {
  /**
   * Create a new reservation
   * POST /api/reservations
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: reservation,
      });
    } catch (error: any) {
      logger.error('Create reservation error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient or doctor ID',
        });
      }

      next(error);
    }
  },

  /**
   * Get all reservations
   * GET /api/reservations
   */
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await reservationService.findAll();
      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      logger.error('Find all reservations error:', error);
      next(error);
    }
  },

  /**
   * Get today's reservations
   * GET /api/reservations/today
   */
  async findToday(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await reservationService.findToday();
      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      logger.error('Find today reservations error:', error);
      next(error);
    }
  },

  /**
   * Get reservation by ID
   * GET /api/reservations/:id
   */
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const reservation = await reservationService.findById(id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found',
        });
      }

      res.json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      logger.error('Find reservation by ID error:', error);
      next(error);
    }
  },

  /**
   * Get reservations by patient
   * GET /api/reservations/patient/:patientId
   */
  async findByPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = parseInt(req.params.patientId);
      const reservations = await reservationService.findByPatient(patientId);

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      logger.error('Find reservations by patient error:', error);
      next(error);
    }
  },

  /**
   * Get reservations by doctor
   * GET /api/reservations/doctor/:doctorId
   */
  async findByDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const reservations = await reservationService.findByDoctor(doctorId);

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      logger.error('Find reservations by doctor error:', error);
      next(error);
    }
  },

  /**
   * Get reservations by date
   * GET /api/reservations/date/:date
   */
  async findByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.params;
      const reservations = await reservationService.findByDate(date);

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      logger.error('Find reservations by date error:', error);
      next(error);
    }
  },

  /**
   * Get reservations by doctor and date
   * GET /api/reservations/doctor/:doctorId/date/:date
   */
  async findByDoctorAndDate(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const { date } = req.params;
      const reservations = await reservationService.findByDoctorAndDate(doctorId, date);

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      logger.error('Find reservations by doctor and date error:', error);
      next(error);
    }
  },

  /**
   * Get queue statistics
   * GET /api/reservations/stats/:doctorId/:date
   */
  async getQueueStats(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const { date } = req.params;
      const stats = await reservationService.getQueueStats(doctorId, date);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Get queue stats error:', error);
      next(error);
    }
  },

  /**
   * Confirm reservation
   * PUT /api/reservations/:id/confirm
   */
  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const reservation = await reservationService.confirm(id);

      res.json({
        success: true,
        message: 'Reservation confirmed',
        data: reservation,
      });
    } catch (error: any) {
      logger.error('Confirm reservation error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found',
        });
      }

      next(error);
    }
  },

  /**
   * Complete reservation
   * PUT /api/reservations/:id/complete
   */
  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const reservation = await reservationService.complete(id);

      res.json({
        success: true,
        message: 'Reservation completed',
        data: reservation,
      });
    } catch (error: any) {
      logger.error('Complete reservation error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found',
        });
      }

      next(error);
    }
  },

  /**
   * Cancel reservation
   * PUT /api/reservations/:id/cancel
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const reservation = await reservationService.cancel(id);

      res.json({
        success: true,
        message: 'Reservation cancelled',
        data: reservation,
      });
    } catch (error: any) {
      logger.error('Cancel reservation error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found',
        });
      }

      next(error);
    }
  },

  /**
   * Reschedule reservation
   * PUT /api/reservations/:id/reschedule
   */
  async reschedule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { newDate, newTime } = req.body;

      if (!newDate || !newTime) {
        return res.status(400).json({
          success: false,
          message: 'New date and time are required',
        });
      }

      const reservation = await reservationService.reschedule(id, newDate, newTime);

      res.json({
        success: true,
        message: 'Reservation rescheduled',
        data: reservation,
      });
    } catch (error: any) {
      logger.error('Reschedule reservation error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found',
        });
      }

      next(error);
    }
  },

  /**
   * Delete reservation
   * DELETE /api/reservations/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await reservationService.delete(id);

      res.json({
        success: true,
        message: 'Reservation deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete reservation error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found',
        });
      }

      next(error);
    }
  },
};

export default reservationController;
