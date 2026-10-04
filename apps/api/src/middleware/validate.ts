import { RequestHandler } from 'express';
import { z } from 'zod';
import { ValidationError } from '../errors';

const idSchema = z.uuid();

// Returns the parsed value, or throws a 400 listing each problem as "field: message".
export function parseWith<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
      .join('; ');
    throw new ValidationError(message);
  }
  return result.data;
}

export const validateId: RequestHandler = (req, _res, next) => {
  if (!idSchema.safeParse(req.params.id).success) {
    throw new ValidationError('id: must be a valid UUID');
  }
  next();
};

export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = parseWith(schema, req.body);
    next();
  };
}
