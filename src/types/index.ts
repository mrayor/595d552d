import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export enum NODE_ENV {
    test = 'test',
    development = 'development',
    production = 'production',
    staging = 'staging',
}


export type ResponseHelper = {
    res: Response;
    code: StatusCodes;
    data?: unknown;
    meta?: unknown;
    success: boolean;
    error?: unknown;
    message: string;
};

export type ValidateCorsOrigin = {
    origin: string | undefined;
    callback: (err: Error | null, origin?: boolean) => void;
    appOrigin: string;
};


export enum TokenExpiry {
    Access = 604800,
    Refresh = 2592000,
}

export enum Cookies {
    AccessToken = 'accessToken',
    RefreshToken = 'refreshToken',
}

export enum RedisKeys {
    tokenBlacklist = 'tokenBlacklist',
}

export type PaginatePayload = {
    total: number;
    page?: string;
    limit?: string;
}

export interface PaginationPayload {
    start: number;
    limit: number;
}