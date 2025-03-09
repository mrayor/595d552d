import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException, response } from '@utils/helpers';
import { Logger } from '@configs/winston.config';

export const errorHandler = (error: HttpException, req: Request, res: Response, _next: NextFunction): void => {
    const status = error.statusCode ?? (error.status || StatusCodes.INTERNAL_SERVER_ERROR);
    Logger.error(`${req.method} ${req.path} - ${status}`, error);
    response({
        code: status,
        message: error.message,
        res,
        success: false,
    });
};

export default errorHandler;
