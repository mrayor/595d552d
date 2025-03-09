import { StatusCodes } from 'http-status-codes';
import userController from '@controllers/user.controller';
import userService from '@services/user.service';
import { Request, Response } from 'express';

jest.mock('@services/user.service');

describe('User Controller - Integration', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
    };

    beforeEach(() => {
        mockResponse = {
            locals: {
                user: {
                    sub: mockUser._id,
                },
            },
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        mockRequest = {};
        jest.clearAllMocks();
    });

    describe('authenticatedUser', () => {
        it('should return user details successfully', async () => {
            (userService.findUserById as jest.Mock).mockResolvedValue(mockUser);

            await userController.authenticatedUser(
                mockRequest as Request,
                mockResponse as Response,
            );

            expect(userService.findUserById).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.OK,
                data: mockUser,
                message: 'User details fetched successfully',
                success: true,
            });
        });

        it('should return 404 when user is not found', async () => {
            (userService.findUserById as jest.Mock).mockResolvedValue(null);

            await userController.authenticatedUser(
                mockRequest as Request,
                mockResponse as Response,
            );

            expect(userService.findUserById).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.NOT_FOUND,
                message: 'This user does not exist',
                success: false,
            });
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Database error');
            (userService.findUserById as jest.Mock).mockRejectedValue(error);

            await userController.authenticatedUser(
                mockRequest as Request,
                mockResponse as Response,
            );

            expect(userService.findUserById).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                message: error.message,
                success: false,
            });
        });
    });
}); 