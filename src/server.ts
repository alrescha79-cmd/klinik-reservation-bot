import app from './app';
import { env } from './config/env';
import logger from './utils/logger';
import { startBot } from './bot';
import { doctorService } from './modules/doctor/doctor.service';
import prisma from './config/database';

const main = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Seed initial doctors
    await doctorService.seed();
    logger.info('✅ Initial data seeded');

    // Start Express server
    app.listen(env.PORT, () => {
      logger.info(`✅ Server running on port ${env.PORT}`);
      logger.info(`📡 API: http://localhost:${env.PORT}`);
    });

    // Start WhatsApp Bot
    await startBot();
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start application
main();
