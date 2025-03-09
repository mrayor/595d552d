import { response } from '@utils/helpers';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({ body: req.body, params: req.params, query: req.query });
        return next();
    } catch (e: unknown) {
        const error = e as ZodError;
        return response({
            code: StatusCodes.BAD_REQUEST,
            error: error.errors,
            message: error.errors.map(err => err.message).join(', '),
            res,
            success: false,
        });
    }
};
