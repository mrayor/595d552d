import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { errorHandler } from '@middlewares/error.middleware';
import { HttpException } from '@utils/helpers';

describe('Error Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = {
            method: 'GET',
            path: '/test'
        };
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    it('should handle HttpException with custom status code', () => {
        const error = new HttpException(StatusCodes.BAD_REQUEST, 'Custom error');

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockResponse.json).toHaveBeenCalledWith({
            code: StatusCodes.BAD_REQUEST,
            message: 'Custom error',
            success: false
        });
    });

    it('should handle unknown errors with 500 status code', () => {
        const error = new Error('Unknown error') as HttpException;

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith({
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Unknown error',
            success: false
        });
    });

    it('should handle errors with status property', () => {
        const error = new Error('Status error') as HttpException;
        error.status = StatusCodes.NOT_FOUND;

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
        expect(mockResponse.json).toHaveBeenCalledWith({
            code: StatusCodes.NOT_FOUND,
            message: 'Status error',
            success: false
        });
    });
}); 