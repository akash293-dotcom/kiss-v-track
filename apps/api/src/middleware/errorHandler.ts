import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = (err as any).details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      code = 'CONFLICT';
      message = 'A record with this value already exists';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = 'Record not found';
    } else {
      statusCode = 400;
      code = 'DATABASE_ERROR';
      message = 'Database operation failed';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid data provided for database operation';
  } else if (err.name === 'ZodError') {
    // Should be handled by validate middleware, but just in case
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Unhandled Error:', {
      error: err.message,
      stack: err.stack,
      requestId: req.requestId,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn(`API Error [${statusCode}]: ${message}`, {
      requestId: req.requestId,
      path: req.path,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {})
    },
  });
};
