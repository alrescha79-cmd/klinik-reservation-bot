import { WASocket, BaileysEventMap } from '@whiskeysockets/baileys';
import logger from '../../utils/logger';
import { handleMessage } from './messageHandler';

/**
 * Setup event handlers for Baileys socket
 */
export const setupEventHandlers = (sock: WASocket): void => {
  // Handle incoming messages
  sock.ev.on('messages.upsert', async (m) => {
    const messages = m.messages;

    for (const message of messages) {
      // Only process new messages
      if (m.type === 'notify') {
        await handleMessage(sock, message);
      }
    }
  });

  // Handle presence updates
  sock.ev.on('presence.update', (update) => {
    logger.debug('Presence update:', update);
  });

  // Handle chat updates
  sock.ev.on('chats.update', (updates) => {
    logger.debug('Chats update:', updates);
  });

  // Handle contacts updates
  sock.ev.on('contacts.update', (updates) => {
    logger.debug('Contacts update:', updates);
  });

  // Handle group participants updates
  sock.ev.on('group-participants.update', (update) => {
    logger.info('Group participants update:', update);
  });

  logger.info('Event handlers registered');
};

export default setupEventHandlers;
