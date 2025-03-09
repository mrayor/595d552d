import { response } from '@utils/helpers';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const authGuard = (_req: Request, res: Response, next: NextFunction) => {
    const { user } = res.locals;

    if (!user) {
        return response({
            code: StatusCodes.UNAUTHORIZED,
            message: 'Unauthorized',
            res,
            success: false,
        });
    }
    return next();
};
