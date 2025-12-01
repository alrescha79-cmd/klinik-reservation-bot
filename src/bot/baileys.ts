import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  BaileysEventMap,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import { getSessionPath } from '../config/env';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { handleMessage } from './handlers/messageHandler';

let sock: WASocket | null = null;

/**
 * Register message event handlers
 */
const registerMessageHandler = (socket: WASocket): void => {
  socket.ev.on('messages.upsert', async (m) => {
    const messages = m.messages;

    for (const message of messages) {
      // Only process new messages (notify = new message)
      if (m.type === 'notify') {
        try {
          await handleMessage(socket, message);
        } catch (error) {
          logger.error('Error in message handler:', error);
        }
      }
    }
  });

  logger.info('Message handler registered');
};

/**
 * Initialize WhatsApp connection using Baileys
 */
export const initBaileys = async (): Promise<WASocket> => {
  const sessionPath = getSessionPath();

  // Ensure session directory exists
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  sock = makeWASocket({
    auth: state,
    logger: logger.pino.child({ level: 'warn' }) as any,
    browser: ['WA Bot Klinik', 'Chrome', '1.0.0'],
  });

  // Register message handler immediately after socket creation
  registerMessageHandler(sock);

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 Scan QR Code ini dengan WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\nBuka WhatsApp > Linked Devices > Link a Device\n');
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      logger.warn(
        `Connection closed. Reconnecting: ${shouldReconnect}`,
        lastDisconnect?.error
      );

      if (shouldReconnect) {
        // Reconnect
        setTimeout(() => initBaileys(), 5000);
      } else {
        logger.info('Logged out. Please scan QR code again.');
        // Clear session
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
        }
        setTimeout(() => initBaileys(), 5000);
      }
    } else if (connection === 'open') {
      logger.info('✅ WhatsApp connection established!');
    }
  });

  // Save credentials when updated
  sock.ev.on('creds.update', saveCreds);

  return sock;
};

/**
 * Get current socket instance
 */
export const getSocket = (): WASocket | null => {
  return sock;
};

/**
 * Send a text message
 */
export const sendMessage = async (
  jid: string,
  text: string
): Promise<void> => {
  if (!sock) {
    throw new Error('WhatsApp not connected');
  }

  await sock.sendMessage(jid, { text });
};

/**
 * Send a message with buttons (using list)
 */
export const sendListMessage = async (
  jid: string,
  title: string,
  description: string,
  buttonText: string,
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>
): Promise<void> => {
  if (!sock) {
    throw new Error('WhatsApp not connected');
  }

  await sock.sendMessage(jid, {
    text: `${title}\n\n${description}`,
  });
};

export default {
  initBaileys,
  getSocket,
  sendMessage,
  sendListMessage,
};
