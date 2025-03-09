import { PaginatePayload, RedisKeys, ResponseHelper, ValidateCorsOrigin } from 'src/types';
import jwt from 'jsonwebtoken';
import { Logger } from '@configs/winston.config';
import { client } from '@configs/redis.config';

type SignJwtPayload = {
    payload: Record<string, unknown>;
    key: string;
    options?: jwt.SignOptions;
};

type VerifyJwtPayload = {
    token: string;
    key: string;
};

export const signJwt = ({ key, payload, options }: SignJwtPayload) => {
    const signingKey = Buffer.from(key, 'base64').toString('ascii');
    return jwt.sign(payload, signingKey, {
        ...options,
        algorithm: 'RS256',
    });
};

export const verifyJwt = <T>({ key, token }: VerifyJwtPayload) => {
    const publicKey = Buffer.from(key, 'base64').toString('ascii');
    try {
        const decoded = jwt.verify(token, publicKey);
        return {
            decoded: decoded as T,
            expired: false,
            valid: true,
        };
    } catch (error: unknown) {
        Logger.error('JWT verification failed', error);
        return {
            decoded: null,
            expired: (error as Error).message === 'jwt expired',
            valid: false,
        };
    }
};

export const validateCorsOrigin = ({ origin, callback, appOrigin }: ValidateCorsOrigin) => {
    if (appOrigin === '*' || !origin) return callback(null, true);

    if (appOrigin.split(',').indexOf(origin) === -1) {
        const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
    }

    return callback(null, true);
};

export const response = (responseHelper: ResponseHelper): void => {
    const { res, ...rest } = responseHelper;

    res.status(responseHelper.code).json({
        ...rest,
    });
};

export class HttpException extends Error {
    statusCode?: number;

    status?: number;

    message: string;

    error: string | null;

    constructor(statusCode: number, message: string, error?: string) {
        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.error = error ?? null;
    }
}

export const blacklistToken = (token: string) => client.lPush(RedisKeys.tokenBlacklist, token);

export const paginate = ({ total, page = '0', limit = '0' }: PaginatePayload) => {
    const currentPage = parseInt(page, 10);
    const previousPage = currentPage - 1;
    const nextPage = currentPage + 1;
    const parsedLimit = parseInt(limit, 10);

    const start = parsedLimit * previousPage;
    const end = parsedLimit * currentPage;
    const totalPages = Math.ceil(total / parsedLimit);

    return {
        limit: parsedLimit,
        main: {
            ...(previousPage > 0 && { previousPage }),
            ...(end < total && { nextPage }),
            currentPage,
            pageLimit: parsedLimit,
            total,
            totalPages,
        },
        start,
    };
};
