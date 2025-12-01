import { Request, Response, NextFunction } from 'express';
import { poliService } from './poli.service';
import logger from '../../utils/logger';

export const poliController = {
    /**
     * Create a new Poli
     * POST /api/poli
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const poli = await poliService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Poli created successfully',
                data: poli,
            });
        } catch (error: any) {
            logger.error('Create poli error:', error);

            if (error.code === 'P2002') {
                return res.status(400).json({
                    success: false,
                    message: 'Poli with this name already exists',
                });
            }

            next(error);
        }
    },

    /**
     * Get all Poli
     * GET /api/poli
     */
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const activeOnly = req.query.active !== 'false';
            const polis = await poliService.findAll(activeOnly);
            res.json({
                success: true,
                data: polis,
            });
        } catch (error) {
            logger.error('Find all poli error:', error);
            next(error);
        }
    },

    /**
     * Get Poli by ID
     * GET /api/poli/:id
     */
    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const poli = await poliService.findById(id);

            if (!poli) {
                return res.status(404).json({
                    success: false,
                    message: 'Poli not found',
                });
            }

            res.json({
                success: true,
                data: poli,
            });
        } catch (error) {
            logger.error('Find poli by ID error:', error);
            next(error);
        }
    },

    /**
     * Update Poli
     * PUT /api/poli/:id
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const poli = await poliService.update(id, req.body);

            res.json({
                success: true,
                message: 'Poli updated successfully',
                data: poli,
            });
        } catch (error: any) {
            logger.error('Update poli error:', error);

            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Poli not found',
                });
            }

            if (error.code === 'P2002') {
                return res.status(400).json({
                    success: false,
                    message: 'Poli with this name already exists',
                });
            }

            next(error);
        }
    },

    /**
     * Delete Poli (soft delete)
     * DELETE /api/poli/:id
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            await poliService.delete(id);

            res.json({
                success: true,
                message: 'Poli deactivated successfully',
            });
        } catch (error: any) {
            logger.error('Delete poli error:', error);

            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Poli not found',
                });
            }

            next(error);
        }
    },

    /**
     * Get Poli schedule for a specific day
     * GET /api/poli/:id/schedule/:day
     */
    async getScheduleForDay(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const { day } = req.params;

            const schedule = await poliService.getScheduleForDay(id, day);

            if (schedule === null) {
                return res.status(404).json({
                    success: false,
                    message: 'Poli not found',
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
            logger.error('Get poli schedule error:', error);
            next(error);
        }
    },

    /**
     * Seed common Poli types (development only)
     * POST /api/poli/seed
     */
    async seed(req: Request, res: Response, next: NextFunction) {
        try {
            await poliService.seed();
            res.json({
                success: true,
                message: 'Poli seeded successfully',
            });
        } catch (error) {
            logger.error('Seed poli error:', error);
            next(error);
        }
    },
};

export default poliController;
