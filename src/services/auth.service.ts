import { User } from '@models/user.model';
import { DocumentType } from '@typegoose/typegoose';
import { CookieOptions, Response } from 'express';
import crypto from 'crypto';
import constants from '@utils/constants';
import { signJwt, verifyJwt } from '@utils/helpers';
import { Cookies, TokenExpiry } from 'src/types';
import { Logger } from '@configs/winston.config';
import userService from './user.service';

const { NODE, ENV, COOKIES, JWT } = constants;
const isProduction = NODE.env === ENV.production;

const defaultCookieOptions: CookieOptions = {
    domain: COOKIES.domain,
    httpOnly: true,
    path: COOKIES.path,
    sameSite: isProduction ? 'strict' : 'lax',
    secure: isProduction,
};


const signAccessToken = (user: DocumentType<User>) => {
    const payload = { sub: user._id };

    return signJwt({
        key: JWT.accessTokenPrivateKey,
        options: { expiresIn: TokenExpiry.Access, jwtid: crypto.randomUUID() },
        payload,
    });
};

const signRefreshToken = async (userId: string) => {
    return signJwt({
        key: JWT.refreshTokenPrivateKey,
        options: { expiresIn: TokenExpiry.Refresh, jwtid: crypto.randomUUID() },
        payload: { sub: userId },
    });
};

const reissueAccessToken = async (refreshToken: string) => {
    const invalid = { accessToken: '', success: false };
    try {
        const { decoded } = verifyJwt<{ sub: string }>({
            key: JWT.refreshTokenPublicKey,
            token: refreshToken,
        });

        if (!decoded) return invalid;

        const user = await userService.findUserById(decoded.sub);

        if (!user) return invalid;

        const accessToken = signAccessToken(user);

        return {
            accessToken,
            success: true,
        };
    } catch (error) {
        Logger.error('Error reissuing access token', error);
        return invalid;
    }
};

const setTokens = (res: Response, access: string, refresh?: string) => {
    const MILLISECONDS = 1000;
    res.cookie(Cookies.AccessToken, access, { ...defaultCookieOptions, maxAge: TokenExpiry.Access * MILLISECONDS });
    if (refresh) {
        res.cookie(Cookies.RefreshToken, refresh, { ...defaultCookieOptions, maxAge: TokenExpiry.Refresh * MILLISECONDS });
    }
};

const clearTokens = (res: Response) => {
    res.cookie(Cookies.AccessToken, '', { ...defaultCookieOptions, maxAge: 0 });
    res.cookie(Cookies.RefreshToken, '', { ...defaultCookieOptions, maxAge: 0 });
};

const authService = {
    clearTokens,
    reissueAccessToken,
    setTokens,
    signAccessToken,
    signRefreshToken,
};

export default authService;
