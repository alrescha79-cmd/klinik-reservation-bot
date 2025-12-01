import { Request, Response, NextFunction } from 'express';
import { patientService } from './patient.service';
import logger from '../../utils/logger';

export const patientController = {
  /**
   * Create a new patient
   * POST /api/patients
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: patient,
      });
    } catch (error: any) {
      logger.error('Create patient error:', error);

      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'NIK or phone number already registered',
        });
      }

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
   * Get all patients
   * GET /api/patients
   */
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const patients = await patientService.findAll();
      res.json({
        success: true,
        data: patients,
      });
    } catch (error) {
      logger.error('Find all patients error:', error);
      next(error);
    }
  },

  /**
   * Get patient by ID
   * GET /api/patients/:id
   */
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const patient = await patientService.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      res.json({
        success: true,
        data: patient,
      });
    } catch (error) {
      logger.error('Find patient by ID error:', error);
      next(error);
    }
  },

  /**
   * Get patient by phone
   * GET /api/patients/phone/:phone
   */
  async findByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.params;
      const patient = await patientService.findByPhone(phone);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      res.json({
        success: true,
        data: patient,
      });
    } catch (error) {
      logger.error('Find patient by phone error:', error);
      next(error);
    }
  },

  /**
   * Update patient
   * PUT /api/patients/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const patient = await patientService.update(id, req.body);

      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: patient,
      });
    } catch (error: any) {
      logger.error('Update patient error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      next(error);
    }
  },

  /**
   * Delete patient
   * DELETE /api/patients/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await patientService.delete(id);

      res.json({
        success: true,
        message: 'Patient deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete patient error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      next(error);
    }
  },
};

export default patientController;
