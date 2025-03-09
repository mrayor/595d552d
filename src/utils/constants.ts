import { config } from 'dotenv';
import { NODE_ENV } from '../types';

config();

const ENV = {
    test: NODE_ENV.test,
    development: NODE_ENV.development,
    production: NODE_ENV.production,
    staging: NODE_ENV.staging,
};

const NODE = {
    env: process.env.NODE_ENV,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
};

const DATABASE_URL = process.env.DATABASE_URL;

const API_PREFIX = '/api';

const ROUTES = {
    home: '/',
    user: {
        authenticated: '/authenticated',
    },
    auth: {
        signup: '/signup',
        login: '/login',
        logout: '/logout',
        refreshToken: '/refresh-token',
    },
    notes: {
        index: '/',
        single: '/:id',
        share: '/:id/share',
    },
    search: {
        index: '/search',
    }
};

const ORIGIN = process.env.ORIGIN ?? '*';

const COOKIES = {
    domain: process.env.COOKIES_DOMAIN as string,
    path: '/',
};

const DEFAULTS = {
    port: 3000,
};

const REGEX = {
    capitalLetters: /[A-Z]+/,
    number: /\d+/i,
    smallLetters: /[a-z]+/,
    specialSymbol: /^(?=.*[!@#$%^&()_+{}[\]:;<>,.?~|])/g,
};

const REDIS_URL = process.env.REDIS_URL;

const JWT = {
    accessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY as string,
    accessTokenPublicKey: process.env.ACCESS_TOKEN_PUBLIC_KEY as string,
    refreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
    refreshTokenPublicKey: process.env.REFRESH_TOKEN_PUBLIC_KEY as string,
};

const constants = {
    API_PREFIX,
    COOKIES,
    DATABASE_URL,
    ENV,
    JWT,
    NODE,
    ORIGIN,
    REDIS_URL,
    REGEX,
    ROUTES,
    DEFAULTS,
};

export default constants;
