import { NextFunction, Request, Response } from 'express';
import { RedisKeys } from '../types/index';
import { client } from '@configs/redis.config';
import { verifyJwt } from '@utils/helpers';

type DeserializePayload = {
    key: string;
};

type IsTokenBlacklistedPayload = {
    token: string;
};

const isTokenBlacklisted = async (payload: IsTokenBlacklistedPayload) => {
    const { token } = payload;
    const blacklistedTokens = await client.lRange(RedisKeys.tokenBlacklist, 0, -1);
    return blacklistedTokens.indexOf(token) > -1;
};

export const deserializeUser =
    (payload: DeserializePayload) => async (req: Request, res: Response, next: NextFunction) => {
        const { key } = payload;
        const [, token] = (req.headers.authorization ?? '').split(' ');

        const accessToken = req.cookies?.accessToken || token;

        if (!accessToken) return next();

        const isBlacklisted = await isTokenBlacklisted({ token: accessToken });

        if (isBlacklisted) return next();

        const { decoded, valid } = verifyJwt({ key, token: accessToken });

        if (decoded && valid) {
            res.locals.user = decoded;
            return next();
        }

        return next();
    };
