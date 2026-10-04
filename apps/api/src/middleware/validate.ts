import { RequestHandler } from 'express';
import { z } from 'zod';
import { ValidationError } from '../errors';

const idSchema = z.uuid();

// Each issue becomes "field: message", e.g. "widthMm: Too big: expected number to be <=150".
function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ');
}

export const validateId: RequestHandler = (req, _res, next) => {
  if (!idSchema.safeParse(req.params.id).success) {
    throw new ValidationError('id: must be a valid UUID');
  }
  next();
};

export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(formatIssues(result.error));
    }
    req.body = result.data;
    next();
  };
}
