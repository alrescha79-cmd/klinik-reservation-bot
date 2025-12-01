import { Request, Response, NextFunction } from 'express';
import { doctorService } from './doctor.service';
import logger from '../../utils/logger';

export const doctorController = {
  /**
   * Create a new doctor
   * POST /api/doctors
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await doctorService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: doctor,
      });
    } catch (error: any) {
      logger.error('Create doctor error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      next(error);
    }
  },

  /**
   * Get all doctors
   * GET /api/doctors
   */
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const doctors = await doctorService.findAll();
      res.json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      logger.error('Find all doctors error:', error);
      next(error);
    }
  },

  /**
   * Get doctor by ID
   * GET /api/doctors/:id
   */
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const doctor = await doctorService.findById(id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }

      res.json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      logger.error('Find doctor by ID error:', error);
      next(error);
    }
  },

  /**
   * Get doctors by specialty
   * GET /api/doctors/specialty/:specialty
   */
  async findBySpecialty(req: Request, res: Response, next: NextFunction) {
    try {
      const { specialty } = req.params;
      const doctors = await doctorService.findBySpecialty(specialty);

      res.json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      logger.error('Find doctors by specialty error:', error);
      next(error);
    }
  },

  /**
   * Update doctor
   * PUT /api/doctors/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const doctor = await doctorService.update(id, req.body);

      res.json({
        success: true,
        message: 'Doctor updated successfully',
        data: doctor,
      });
    } catch (error: any) {
      logger.error('Update doctor error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }

      next(error);
    }
  },

  /**
   * Delete doctor
   * DELETE /api/doctors/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await doctorService.delete(id);

      res.json({
        success: true,
        message: 'Doctor deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete doctor error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }

      next(error);
    }
  },

  /**
   * Get doctor schedule for a specific day
   * GET /api/doctors/:id/schedule/:day
   */
  async getScheduleForDay(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { day } = req.params;

      const schedule = await doctorService.getScheduleForDay(id, day);

      if (schedule === null) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }

      res.json({
        success: true,
        data: {
          day,
          schedule,
        },
      });
    } catch (error) {
      logger.error('Get doctor schedule error:', error);
      next(error);
    }
  },

  /**
   * Seed initial doctors (development only)
   * POST /api/doctors/seed
   */
  async seed(req: Request, res: Response, next: NextFunction) {
    try {
      await doctorService.seed();
      res.json({
        success: true,
        message: 'Doctors seeded successfully',
      });
    } catch (error) {
      logger.error('Seed doctors error:', error);
      next(error);
    }
  },
};

export default doctorController;
