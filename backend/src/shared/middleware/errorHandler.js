import { ApiError } from '../errors/ApiError.js';
import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${err.name}: ${err.message}`, err.stack);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Fallback for unhandled errors
  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred.',
  });
};
