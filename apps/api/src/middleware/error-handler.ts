import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors';

// Turns every error into { error: { code, message } }. Unexpected errors are logged, never shown.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request body is not valid JSON' } });
    return;
  }
  req.log.error({ err }, 'Unexpected error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
