import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export function validateBody<T>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(dtoClass, req.body);
    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true
    });

    if (errors.length > 0) {
      const formatted = errors.map((e) => ({
        property: e.property,
        constraints: e.constraints
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatted
      });
    }

    req.body = instance;
    next();
  };
}

