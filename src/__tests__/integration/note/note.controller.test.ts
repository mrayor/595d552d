import mongoose, { Types } from 'mongoose';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import noteController from '@controllers/note.controller';
import { NoteModel } from '@models/note.model';
import UserModel from '@models/user.model';

describe('Note Controller', () => {
    const mockUserId = new Types.ObjectId();
    const mockUser = {
        _id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
    };

    const mockNoteData = {
        title: 'Test Note',
        content: 'Test Content',
        tags: ['test', 'integration']
    };

    const mockRequest = (body = {}, params = {}, query = {}) => {
        return {
            body,
            params,
            query
        } as Request;
    };

    const mockResponse = () => {
        const res = {} as Response;
        res.locals = { user: { sub: mockUserId.toHexString() } };
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(async () => {
        await NoteModel.deleteMany({});
        await UserModel.deleteMany({});
        await UserModel.create(mockUser);
    });

    describe('getNotes', () => {
        beforeEach(async () => {
            await NoteModel.create([
                { ...mockNoteData, owner: mockUserId },
                { ...mockNoteData, title: 'Second Note', owner: mockUserId }
            ]);
        });

        it('should get all notes successfully', async () => {
            const req = mockRequest({}, {}, { page: '1', perPage: '10' });
            const res = mockResponse();

            await noteController.getNotes(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.arrayContaining([
                        expect.objectContaining({ title: 'Test Note' }),
                        expect.objectContaining({ title: 'Second Note' })
                    ])
                })
            );
        });
    });

    describe('getNoteById', () => {
        let noteId: string;

        beforeEach(async () => {
            const note = await NoteModel.create({ ...mockNoteData, owner: mockUserId });
            noteId = note._id.toString();
        });

        it('should get note by id successfully', async () => {
            const req = mockRequest({}, { id: noteId });
            const res = mockResponse();

            await noteController.getNoteById(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        title: mockNoteData.title,
                        content: mockNoteData.content
                    })
                })
            );
        });

        it('should return 404 for non-existent note', async () => {
            const req = mockRequest({}, { id: new mongoose.Types.ObjectId().toString() });
            const res = mockResponse();

            await noteController.getNoteById(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
        });
    });

    describe('createNote', () => {
        it('should create note successfully', async () => {
            const req = mockRequest(mockNoteData);
            const res = mockResponse();

            await noteController.createNote(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        title: mockNoteData.title,
                        content: mockNoteData.content,
                        tags: mockNoteData.tags
                    })
                })
            );
        });
    });

    describe('updateNote', () => {
        let noteId: string;

        beforeEach(async () => {
            const note = await NoteModel.create({ ...mockNoteData, owner: mockUserId });
            noteId = note._id.toString();
        });

        it('should update note successfully', async () => {
            const updateData = {
                title: 'Updated Title',
                content: 'Updated Content'
            };

            const req = mockRequest(updateData, { id: noteId });
            const res = mockResponse();

            await noteController.updateNote(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining(updateData)
                })
            );
        });

        it('should return 404 for non-existent note', async () => {
            const req = mockRequest(
                { title: 'Updated Title' },
                { id: new mongoose.Types.ObjectId().toString() }
            );
            const res = mockResponse();

            await noteController.updateNote(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
        });
    });

    describe('deleteNote', () => {
        let noteId: string;

        beforeEach(async () => {
            const note = await NoteModel.create({ ...mockNoteData, owner: mockUserId });
            noteId = note._id.toString();
        });

        it('should delete note successfully', async () => {
            const req = mockRequest({}, { id: noteId });
            const res = mockResponse();

            await noteController.deleteNote(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            const note = await NoteModel.findById(noteId);
            expect(note).toBeNull();
        });

        it('should return 404 for non-existent note', async () => {
            const req = mockRequest({}, { id: new mongoose.Types.ObjectId().toString() });
            const res = mockResponse();

            await noteController.deleteNote(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
        });
    });
}); 