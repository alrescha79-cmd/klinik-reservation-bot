import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  ADMIN_PHONE: process.env.ADMIN_PHONE || '',
  SESSION_FOLDER: process.env.SESSION_FOLDER || './config/baileysSession',
};

export const getSessionPath = (): string => {
  return path.resolve(process.cwd(), env.SESSION_FOLDER);
};
