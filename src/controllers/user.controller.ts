import { Logger } from '@configs/winston.config';
import userService from '@services/user.service';
import { response } from '@utils/helpers';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Get logged in user.
 * @route GET /user/authenticated
 */
const authenticatedUser = async (_req: Request, res: Response): Promise<void> => {
    try {
        const { user: u } = res.locals;

        const user = await userService.findUserById(u.sub);

        if (!user) {
            return response({
                code: StatusCodes.NOT_FOUND,
                message: 'This user does not exist',
                res,
                success: false,
            });
        }

        return response({
            code: StatusCodes.OK,
            data: user,
            message: 'User details fetched successfully',
            res,
            success: true,
        });
    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Unable to get user details', err);

        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};

export default {
    authenticatedUser,
};
