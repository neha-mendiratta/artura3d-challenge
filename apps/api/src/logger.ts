import pino, { LoggerOptions } from 'pino';
import { config } from './config';

// Database errors carry the SQL and its values, which can include patient data (patient ref, notes).
// They are hidden in every log line; the error type and message are kept.
const DATABASE_ERROR_FIELDS = ['sql', 'parameters'];
const ERROR_PATHS = ['err', 'err.parent', 'err.original'];

export const loggerOptions: LoggerOptions = {
  level: config.logLevel,
  redact: ERROR_PATHS.flatMap((path) => DATABASE_ERROR_FIELDS.map((field) => `${path}.${field}`)),
};

export const logger = pino(loggerOptions);
