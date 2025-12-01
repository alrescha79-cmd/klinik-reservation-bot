import { initBaileys, getSocket } from './baileys';
import { setupEventHandlers } from './handlers/eventHandler';
import logger from '../utils/logger';

/**
 * Start WhatsApp Bot
 */
export const startBot = async (): Promise<void> => {
  try {
    logger.info('Starting WhatsApp Bot...');

    const sock = await initBaileys();

    // Setup event handlers
    setupEventHandlers(sock);

    logger.info('WhatsApp Bot initialized successfully');
  } catch (error) {
    logger.error('Failed to start WhatsApp Bot:', error);
    throw error;
  }
};

export { getSocket } from './baileys';
export { sendMessage } from './baileys';

export default {
  startBot,
  getSocket,
};
