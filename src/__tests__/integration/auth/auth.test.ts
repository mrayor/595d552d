import { StatusCodes } from 'http-status-codes';
import authController from '@controllers/auth.controller';
import userService from '@services/user.service';
import authService from '@services/auth.service';
import { Request, Response } from 'express';
import { LoginUserInput } from '@schemas/auth.schema';
import { RegisterUserInput } from '@schemas/user.schema';

jest.mock('@services/user.service');
jest.mock('@services/auth.service');

describe('Auth Controller - Integration', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        validatePassword: jest.fn()
    };

    beforeEach(() => {
        mockResponse = {
            cookie: jest.fn(),
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('signup', () => {
        beforeEach(() => {
            mockRequest = {
                body: {
                    email: mockUser.email,
                    password: mockUser.password,
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName
                }
            };
        });

        it('should create a new user successfully', async () => {
            (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
            (authService.signAccessToken as jest.Mock).mockReturnValue('mock-access-token');
            (authService.signRefreshToken as jest.Mock).mockResolvedValue('mock-refresh-token');

            await authController.signup(
                mockRequest as Request<Record<string, unknown>, Record<string, unknown>, RegisterUserInput>,
                mockResponse as Response
            );

            expect(userService.createUser).toHaveBeenCalledWith(mockRequest.body);
            expect(authService.signAccessToken).toHaveBeenCalledWith(mockUser);
            expect(authService.signRefreshToken).toHaveBeenCalledWith(mockUser._id);
            expect(authService.setTokens).toHaveBeenCalledWith(mockResponse, 'mock-access-token', 'mock-refresh-token');
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.CREATED,
                message: 'User registered successfully',
                success: true
            });
        });

        it('should handle duplicate email error', async () => {
            const error: any = new Error('Duplicate key error');
            error.code = 11000;
            (userService.createUser as jest.Mock).mockRejectedValue(error);

            await authController.signup(
                mockRequest as Request<Record<string, unknown>, Record<string, unknown>, RegisterUserInput>,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.CONFLICT,
                message: 'Email already exists',
                success: false
            });
        });
    });

    describe('login', () => {
        beforeEach(() => {
            mockRequest = {
                body: {
                    email: mockUser.email,
                    password: mockUser.password
                }
            };
        });

        it('should login successfully with valid credentials', async () => {
            const mockTokens = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token'
            };

            (userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
            mockUser.validatePassword.mockResolvedValue(true);
            (authService.signAccessToken as jest.Mock).mockReturnValue(mockTokens.accessToken);
            (authService.signRefreshToken as jest.Mock).mockResolvedValue(mockTokens.refreshToken);

            await authController.login(
                mockRequest as Request<Record<string, unknown>, Record<string, unknown>, LoginUserInput>,
                mockResponse as Response
            );

            expect(userService.findUserByEmail).toHaveBeenCalledWith(mockUser.email);
            expect(mockUser.validatePassword).toHaveBeenCalledWith(mockUser.password);
            expect(authService.signAccessToken).toHaveBeenCalledWith(mockUser);
            expect(authService.signRefreshToken).toHaveBeenCalledWith(mockUser._id);
            expect(authService.setTokens).toHaveBeenCalledWith(mockResponse, mockTokens.accessToken, mockTokens.refreshToken);
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.OK,
                data: {
                    accessToken: mockTokens.accessToken,
                    refreshToken: mockTokens.refreshToken
                },
                message: 'Login successful',
                success: true
            });
        });

        it('should return 401 for invalid email', async () => {
            (userService.findUserByEmail as jest.Mock).mockResolvedValue(null);

            await authController.login(
                mockRequest as Request<Record<string, unknown>, Record<string, unknown>, LoginUserInput>,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.UNAUTHORIZED,
                message: 'Invalid email or password',
                success: false
            });
        });

        it('should return 401 for invalid password', async () => {
            (userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
            mockUser.validatePassword.mockResolvedValue(false);

            await authController.login(
                mockRequest as Request<Record<string, unknown>, Record<string, unknown>, LoginUserInput>,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.UNAUTHORIZED,
                message: 'Invalid email or password',
                success: false
            });
        });
    });

    describe('logout', () => {
        const mockToken = 'valid-token';

        beforeEach(() => {
            mockRequest = {
                headers: {
                    authorization: `Bearer ${mockToken}`,
                    'x-refresh-token': 'refresh-token'
                },
                cookies: {
                    accessToken: mockToken,
                    refreshToken: 'refresh-token'
                }
            };
        });

        it('should logout successfully', async () => {
            await authController.logout(mockRequest as Request, mockResponse as Response);

            expect(authService.clearTokens).toHaveBeenCalledWith(mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.OK,
                message: 'Logout successful',
                success: true
            });
        });
    });

    describe('refreshAccessToken', () => {
        const mockRefreshToken = 'valid-refresh-token';
        const mockNewAccessToken = 'new-access-token';

        beforeEach(() => {
            mockRequest = {
                cookies: {
                    refreshToken: mockRefreshToken
                },
                headers: {
                    'x-refresh-token': mockRefreshToken
                }
            };
        });

        it('should refresh access token successfully', async () => {
            (authService.reissueAccessToken as jest.Mock).mockResolvedValue({
                accessToken: mockNewAccessToken,
                success: true
            });

            await authController.refreshAccessToken(mockRequest as Request, mockResponse as Response);

            expect(authService.reissueAccessToken).toHaveBeenCalledWith(mockRefreshToken);
            expect(authService.setTokens).toHaveBeenCalledWith(mockResponse, mockNewAccessToken);
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.OK,
                data: {
                    accessToken: mockNewAccessToken
                },
                message: 'Token refreshed successfully',
                success: true
            });
        });

        it('should return 401 when refresh token is invalid', async () => {
            (authService.reissueAccessToken as jest.Mock).mockResolvedValue({
                accessToken: '',
                success: false
            });

            await authController.refreshAccessToken(mockRequest as Request, mockResponse as Response);

            expect(authService.clearTokens).toHaveBeenCalledWith(mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.UNAUTHORIZED,
                message: 'Access token could not be refreshed',
                success: false
            });
        });

        it('should return 401 when access token could not be refreshed', async () => {
            (authService.reissueAccessToken as jest.Mock).mockResolvedValue({
                accessToken: '',
                success: false
            });

            await authController.refreshAccessToken(mockRequest as Request, mockResponse as Response);

            expect(authService.clearTokens).toHaveBeenCalledWith(mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.UNAUTHORIZED,
                message: 'Access token could not be refreshed',
                success: false
            });
        });
    });
}); 