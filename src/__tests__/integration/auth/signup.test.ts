import { StatusCodes } from 'http-status-codes';
import authController from '@controllers/auth.controller';
import userService from '@services/user.service';
import { Request, Response } from 'express';
import { RegisterUserInput } from '@schemas/user.schema';

jest.mock('@services/user.service');

describe('Auth Controller - Signup Integration', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const mockUser = {
        email: 'test@user.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
    };

    beforeEach(() => {
        mockResponse = {
            cookie: jest.fn(),
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    it('should successfully create a new user', async () => {
        mockRequest = {
            body: mockUser
        };

        (userService.createUser as jest.Mock).mockResolvedValue({
            ...mockUser,
            _id: 'mockId'
        });

        await authController.signup(
            mockRequest as Request<Record<string, unknown>, Record<string, unknown>, RegisterUserInput>,
            mockResponse as Response
        );

        expect(userService.createUser).toHaveBeenCalledWith(mockUser);
        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED);
        expect(mockResponse.json).toHaveBeenCalledWith({
            code: StatusCodes.CREATED,
            message: 'User registered successfully',
            success: true
        });
    });

    it('should handle duplicate email error', async () => {
        mockRequest = {
            body: mockUser
        };

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

    it('should handle unexpected errors', async () => {
        mockRequest = {
            body: mockUser
        };

        const error = new Error('Unexpected error');
        (userService.createUser as jest.Mock).mockRejectedValue(error);

        await authController.signup(
            mockRequest as Request<Record<string, unknown>, Record<string, unknown>, RegisterUserInput>,
            mockResponse as Response
        );

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith({
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Unexpected error',
            success: false
        });
    });
}); 