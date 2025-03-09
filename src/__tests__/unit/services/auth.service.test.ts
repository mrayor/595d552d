import { Response } from 'express';
import crypto from 'crypto';
import { DocumentType } from '@typegoose/typegoose';
import { User } from '@models/user.model';
import authService from '@services/auth.service';
import userService from '@services/user.service';
import { signJwt, verifyJwt } from '@utils/helpers';
import { Cookies, TokenExpiry } from '../../../types';
import mongoose from 'mongoose';

jest.mock('crypto', () => ({
    ...jest.requireActual('crypto'),
    randomUUID: jest.fn()
}));

jest.mock('@utils/helpers', () => ({
    signJwt: jest.fn(),
    verifyJwt: jest.fn()
}));

jest.mock('@services/user.service');

describe('Auth Service', () => {
    const mockUserId = new mongoose.Types.ObjectId().toString();
    const mockUser = {
        _id: mockUserId,
        email: 'test@example.com',
        validatePassword: jest.fn()
    } as unknown as DocumentType<User>;

    const mockUUID = 'mock-uuid';
    const mockToken = 'mock-token';

    beforeEach(() => {
        jest.clearAllMocks();
        (crypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);
    });

    describe('signAccessToken', () => {
        it('should sign access token with correct payload and options', () => {
            (signJwt as jest.Mock).mockReturnValue(mockToken);

            const result = authService.signAccessToken(mockUser);

            expect(signJwt).toHaveBeenCalledWith({
                key: expect.any(String),
                options: {
                    expiresIn: TokenExpiry.Access,
                    jwtid: mockUUID
                },
                payload: { sub: mockUser._id }
            });
            expect(result).toBe(mockToken);
        });
    });

    describe('signRefreshToken', () => {
        it('should sign refresh token with correct payload and options', async () => {
            (signJwt as jest.Mock).mockReturnValue(mockToken);

            const result = await authService.signRefreshToken(mockUserId);

            expect(signJwt).toHaveBeenCalledWith({
                key: expect.any(String),
                options: {
                    expiresIn: TokenExpiry.Refresh,
                    jwtid: mockUUID
                },
                payload: { sub: mockUserId }
            });
            expect(result).toEqual(mockToken);
        });
    });

    describe('reissueAccessToken', () => {
        const mockRefreshToken = 'valid-refresh-token';
        const mockDecodedToken = { sub: mockUser._id };

        it('should reissue access token when refresh token is valid', async () => {
            (verifyJwt as jest.Mock).mockReturnValue({ decoded: mockDecodedToken });
            (userService.findUserById as jest.Mock).mockResolvedValue(mockUser);
            (signJwt as jest.Mock).mockReturnValue(mockToken);

            const result = await authService.reissueAccessToken(mockRefreshToken);

            expect(verifyJwt).toHaveBeenCalledWith({
                key: expect.any(String),
                token: mockRefreshToken
            });
            expect(userService.findUserById).toHaveBeenCalledWith(mockDecodedToken.sub);
            expect(result).toEqual({
                accessToken: mockToken,
                success: true
            });
        });

        it('should return invalid result when refresh token is invalid', async () => {
            (verifyJwt as jest.Mock).mockReturnValue({ decoded: null });

            const result = await authService.reissueAccessToken(mockRefreshToken);

            expect(result).toEqual({
                accessToken: '',
                success: false
            });
        });

        it('should return invalid result when user not found', async () => {
            (verifyJwt as jest.Mock).mockReturnValue({ decoded: mockDecodedToken });
            (userService.findUserById as jest.Mock).mockResolvedValue(null);

            const result = await authService.reissueAccessToken(mockRefreshToken);

            expect(result).toEqual({
                accessToken: '',
                success: false
            });
        });
    });

    describe('setTokens and clearTokens', () => {
        let mockResponse: Partial<Response>;
        const mockAccessToken = 'access-token';
        const mockRefreshToken = 'refresh-token';

        beforeEach(() => {
            mockResponse = {
                cookie: jest.fn()
            };
        });

        it('should set access and refresh tokens with correct options', () => {
            authService.setTokens(mockResponse as Response, mockAccessToken, mockRefreshToken);

            expect(mockResponse.cookie).toHaveBeenCalledWith(
                Cookies.AccessToken,
                mockAccessToken,
                expect.objectContaining({
                    maxAge: TokenExpiry.Access * 1000
                })
            );
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                Cookies.RefreshToken,
                mockRefreshToken,
                expect.objectContaining({
                    maxAge: TokenExpiry.Refresh * 1000
                })
            );
        });

        it('should only set access token if refresh token is not provided', () => {
            authService.setTokens(mockResponse as Response, mockAccessToken);

            expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                Cookies.AccessToken,
                mockAccessToken,
                expect.any(Object)
            );
        });

        it('should clear both tokens', () => {
            authService.clearTokens(mockResponse as Response);

            expect(mockResponse.cookie).toHaveBeenCalledWith(
                Cookies.AccessToken,
                '',
                expect.objectContaining({ maxAge: 0 })
            );
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                Cookies.RefreshToken,
                '',
                expect.objectContaining({ maxAge: 0 })
            );
        });
    });
}); 