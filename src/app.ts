import express, { Application, Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import logger from './utils/logger';

// Import routes
import patientRoutes from './modules/patient/patient.route';
import doctorRoutes from './modules/doctor/doctor.route';
import reservationRoutes from './modules/reservation/reservation.route';
import poliRoutes from './modules/poli/poli.route';

// Create Express app
const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/poli', poliRoutes);
app.use('/api/reservations', reservationRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'WA Bot Klinik API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      patients: '/api/patients',
      doctors: '/api/doctors',
      poli: '/api/poli',
      reservations: '/api/reservations',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
