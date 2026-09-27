import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../lib/errors';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        // We'll pass the details through a standard ValidationError, 
        // though custom formatting could be done in errorHandler
        const err = new ValidationError('Validation Failed');
        (err as any).details = issues;
        next(err);
      } else {
        next(error);
      }
    }
  };
};
