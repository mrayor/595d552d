import { Types } from 'mongoose';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import searchController from '@controllers/search.controller';
import noteService from '@services/note.service';

jest.mock('@services/note.service');

describe('Search Controller - Integration', () => {
    const mockUserId = new Types.ObjectId();
    const mockNotes = [
        { _id: new Types.ObjectId(), title: 'Test Note', content: 'Test content' },
        { _id: new Types.ObjectId(), title: 'Another Test', content: 'More test content' }
    ];

    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockResponse = {
            locals: { user: { sub: mockUserId.toString() } },
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('searchNotes', () => {
        it('should return search results successfully', async () => {
            mockRequest = {
                query: { q: 'test', page: '1', perPage: '10' }
            };

            (noteService.getTotalNotes as jest.Mock).mockResolvedValue(2);
            (noteService.getNotes as jest.Mock).mockResolvedValue(mockNotes);

            await searchController.searchNotes(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(noteService.getTotalNotes).toHaveBeenCalledWith(mockUserId.toString(), 'test');
            expect(noteService.getNotes).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: mockUserId.toString(),
                    searchQuery: 'test',
                    start: 0,
                    limit: 10
                })
            );
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.OK,
                data: mockNotes,
                message: 'Notes fetched successfully',
                meta: expect.any(Object),
                success: true
            });
        });

        it('should return 400 when search query is missing', async () => {
            mockRequest = {
                query: { page: '1', perPage: '10' }
            };

            await searchController.searchNotes(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.BAD_REQUEST,
                message: 'Search query is required',
                success: false
            });
        });

        it('should handle empty search results', async () => {
            mockRequest = {
                query: { q: 'nonexistent', page: '1', perPage: '10' }
            };

            (noteService.getTotalNotes as jest.Mock).mockResolvedValue(0);
            (noteService.getNotes as jest.Mock).mockResolvedValue([]);

            await searchController.searchNotes(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.OK,
                data: [],
                message: 'Notes fetched successfully',
                meta: expect.any(Object),
                success: true
            });
        });

        it('should handle service errors gracefully', async () => {
            mockRequest = {
                query: { q: 'test', page: '1', perPage: '10' }
            };

            const error = new Error('Database error');
            (noteService.getTotalNotes as jest.Mock).mockRejectedValue(error);

            await searchController.searchNotes(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(mockResponse.json).toHaveBeenCalledWith({
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                message: error.message,
                success: false
            });
        });
    });
}); 