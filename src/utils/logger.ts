import pino from 'pino';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Custom wrapper to handle various logging scenarios
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (args.length > 0) {
      pinoLogger.info({ data: args }, message);
    } else {
      pinoLogger.info(message);
    }
  },
  error: (message: string, error?: unknown) => {
    if (error instanceof Error) {
      pinoLogger.error({ err: error }, message);
    } else if (error !== undefined) {
      pinoLogger.error({ data: error }, message);
    } else {
      pinoLogger.error(message);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (args.length > 0) {
      pinoLogger.warn({ data: args }, message);
    } else {
      pinoLogger.warn(message);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (args.length > 0) {
      pinoLogger.debug({ data: args }, message);
    } else {
      pinoLogger.debug(message);
    }
  },
  child: (bindings: pino.Bindings) => pinoLogger.child(bindings),
  // Expose raw pino logger for Baileys
  pino: pinoLogger,
};

export default logger;
