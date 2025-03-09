import { response } from '@utils/helpers';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Home route
 * @route GET /
 */
const index = async (_req: Request, res: Response): Promise<void> => {
    response({
        code: StatusCodes.OK,
        message: 'Welcome to Notes API',
        res,
        success: true,
    });
};

const home = {
    index,
};

export default home;
