import { Logger } from '@configs/winston.config';
import { LoginUserInput } from '@schemas/auth.schema';
import { RegisterUserInput } from '@schemas/user.schema';
import authService from '@services/auth.service';
import userService from '@services/user.service';
import { response, verifyJwt, blacklistToken } from '@utils/helpers';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import constants from '@utils/constants';

const { JWT } = constants;

interface MongoError extends Error {
    code?: number;
}

/**
 * Register User.
 * @route POST /auth/signup
 */
const signup = async (
    req: Request<Record<string, unknown>, Record<string, unknown>, RegisterUserInput>,
    res: Response,
) => {
    try {
        const { body } = req;

        const user = await userService.createUser(body);
        const accessToken = authService.signAccessToken(user);
        const refreshToken = await authService.signRefreshToken(user._id.toString());

        authService.setTokens(res, accessToken, refreshToken);

        Logger.info(`User "${user.email}" created successfully`);

        return response({
            code: StatusCodes.CREATED,
            message: 'User registered successfully',
            res,
            success: true,
        });
    } catch (error: unknown) {
        const err = error as MongoError;
        Logger.error('User registration failed', err);

        if (err.code === 11000) {
            return response({
                code: StatusCodes.CONFLICT,
                message: 'Email already exists',
                res,
                success: false,
            });
        }

        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};

/**
 *  Login User.
 * @route POST /auth/signup
 */
const login = async (req: Request<Record<string, unknown>, Record<string, unknown>, LoginUserInput>, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await userService.findUserByEmail(email);

        if (!user) {
            return response({
                code: StatusCodes.UNAUTHORIZED,
                message: 'Invalid email or password',
                res,
                success: false,
            });
        }

        const isValidPassword = await user.validatePassword(password);

        if (!isValidPassword) {
            return response({
                code: StatusCodes.UNAUTHORIZED,
                message: 'Invalid email or password',
                res,
                success: false,
            });
        }

        const accessToken = authService.signAccessToken(user);
        const refreshToken = await authService.signRefreshToken(user._id.toString());

        authService.setTokens(res, accessToken, refreshToken);

        return response({
            code: StatusCodes.OK,
            data: {
                accessToken,
                refreshToken,
            },
            message: 'Login successful',
            res,
            success: true,
        });
    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Login failed', err);
        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};

/**
 * Logout user
 * @route POST /auth/logout
 */
const logout = async (req: Request, res: Response) => {
    try {
        const [, token] = (req.headers.authorization ?? '').split(' ');

        const accessToken = req.cookies?.accessToken || token;

        const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];

        const { decoded } = verifyJwt<{ sub: string }>({
            key: JWT.refreshTokenPublicKey,
            token: refreshToken,
        });

        if (!decoded) {
            authService.clearTokens(res);
            return response({
                code: StatusCodes.OK,
                message: 'Logout successful',
                res,
                success: true,
            });
        }

        await blacklistToken(accessToken);

        authService.clearTokens(res);

        Logger.info('Logout successful');

        return response({
            code: StatusCodes.OK,
            message: 'Logout successful',
            res,
            success: true,
        });
    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Logout failed', err);

        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};

/**
 * Refresh access token
 * @route POST /auth/refresh-token
 */
const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
        const { accessToken, success } = await authService.reissueAccessToken(refreshToken);

        if (!success) {
            authService.clearTokens(res);
            return response({
                code: StatusCodes.UNAUTHORIZED,
                message: 'Access token could not be refreshed',
                res,
                success: false,
            });
        }

        authService.setTokens(res, accessToken);

        Logger.info('Access token refreshed successfully');

        return response({
            code: StatusCodes.OK,
            data: {
                accessToken,
            },
            message: 'Token refreshed successfully',
            res,
            success: true,
        });
    } catch (error: unknown) {
        const err = error as Error;
        Logger.error('Refresh access token failed', err);
        authService.clearTokens(res);
        return response({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: err.message, res, success: false });
    }
};


export default {
    signup,
    login,
    logout,
    refreshAccessToken,
};
