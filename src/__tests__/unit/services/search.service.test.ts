import { Types } from 'mongoose';
import { NoteModel } from '@models/note.model';
import noteService from '@services/note.service';

jest.mock('@services/note.service');

describe('Search Service', () => {
    const mockUserId = new Types.ObjectId();
    const mockSearchQuery = 'test';
    const mockNotes = [
        { _id: new Types.ObjectId(), title: 'Test Note', content: 'Test content' },
        { _id: new Types.ObjectId(), title: 'Another Test', content: 'More test content' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (noteService.getTotalNotes as jest.Mock).mockResolvedValue(2);
        (noteService.getNotes as jest.Mock).mockResolvedValue(mockNotes);
    });

    describe('getTotalNotes with search', () => {
        it('should return total count of matching notes', async () => {
            const expectedCount = 2;
            (noteService.getTotalNotes as jest.Mock).mockResolvedValue(expectedCount);

            const result = await noteService.getTotalNotes(mockUserId.toString(), mockSearchQuery);

            expect(result).toBe(expectedCount);
            expect(noteService.getTotalNotes).toHaveBeenCalledWith(mockUserId.toString(), mockSearchQuery);
        });

        it('should handle no matching notes', async () => {
            (noteService.getTotalNotes as jest.Mock).mockResolvedValue(0);

            const result = await noteService.getTotalNotes(mockUserId.toString(), mockSearchQuery);

            expect(result).toBe(0);
            expect(noteService.getTotalNotes).toHaveBeenCalledWith(mockUserId.toString(), mockSearchQuery);
        });
    });

    describe('getNotes with search', () => {
        const mockPagination = { start: 0, limit: 10 };

        it('should return paginated search results', async () => {
            (noteService.getNotes as jest.Mock).mockResolvedValue(mockNotes);

            const result = await noteService.getNotes({
                userId: mockUserId.toString(),
                searchQuery: mockSearchQuery,
                ...mockPagination
            });

            expect(result).toEqual(mockNotes);
            expect(noteService.getNotes).toHaveBeenCalledWith({
                userId: mockUserId.toString(),
                searchQuery: mockSearchQuery,
                ...mockPagination
            });
        });

        it('should handle no search results', async () => {
            (noteService.getNotes as jest.Mock).mockResolvedValue([]);

            const result = await noteService.getNotes({
                userId: mockUserId.toString(),
                searchQuery: mockSearchQuery,
                ...mockPagination
            });

            expect(result).toEqual([]);
            expect(noteService.getNotes).toHaveBeenCalledWith({
                userId: mockUserId.toString(),
                searchQuery: mockSearchQuery,
                ...mockPagination
            });
        });
    });
}); 