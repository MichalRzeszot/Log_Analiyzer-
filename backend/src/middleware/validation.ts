/**
 * Request validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Middleware factory to validate request data
 * Usage: router.post('/path', validate(schema), controller)
 */
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = source === 'body' ? req.body : source === 'query' ? req.query : req.params;

      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details.map((detail) => detail.message).join(', ');
        logger.warn(`Validation error: ${messages}`);
        throw new ValidationError(`Validation failed: ${messages}`);
      }

      // Replace the data with validated data
      if (source === 'body') {
        req.body = value;
      } else if (source === 'query') {
        req.query = value;
      } else {
        req.params = value;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate multiple sources at once
 * Usage: router.post('/path', validateMultiple({
 *   body: bodySchema,
 *   query: querySchema,
 *   params: paramsSchema
 * }), controller)
 */
export const validateMultiple = (schemas: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const { error, value } = schemas.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const messages = error.details.map((detail) => detail.message).join(', ');
          throw new ValidationError(`Body validation failed: ${messages}`);
        }
        req.body = value;
      }

      if (schemas.query) {
        const { error, value } = schemas.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const messages = error.details.map((detail) => detail.message).join(', ');
          throw new ValidationError(`Query validation failed: ${messages}`);
        }
        req.query = value;
      }

      if (schemas.params) {
        const { error, value } = schemas.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const messages = error.details.map((detail) => detail.message).join(', ');
          throw new ValidationError(`Params validation failed: ${messages}`);
        }
        req.params = value;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
