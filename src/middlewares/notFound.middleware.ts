import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { response } from '@utils/helpers';
import { Logger } from '@configs/winston.config';

export const notFoundHandler = (request: Request, res: Response, _next: NextFunction): void => {
    Logger.error(`${request.method} ${request.path} - Route not found`);

    response({
        code: StatusCodes.NOT_FOUND,
        message: 'Route not found',
        res,
        success: false,
    });
};
