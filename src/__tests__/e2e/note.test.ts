import request from 'supertest';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import app from '../../app';
import { NoteModel } from '@models/note.model';
import UserModel from '@models/user.model';
import { signJwt } from '@utils/helpers';
import constants from '@utils/constants';
import crypto from 'crypto';
import { TokenExpiry } from 'src/types';

const { JWT } = constants;

describe('Notes & Search E2E Tests', () => {
    let authToken: string;
    let userId: string;
    let noteId: string;

    const mockUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User'
    };

    const mockNote = {
        title: 'Test Note',
        content: 'Test Content',
        tags: ['test', 'e2e']
    };

    beforeAll(async () => {
        const user = await UserModel.create(mockUser);
        userId = user._id.toHexString();
        authToken = signJwt({
            key: JWT.accessTokenPrivateKey,
            payload: { sub: userId },
            options: { expiresIn: TokenExpiry.Access, jwtid: crypto.randomUUID() }
        });
    });

    beforeEach(async () => {
        await NoteModel.deleteMany({});
    });

    afterAll(async () => {
        await UserModel.deleteMany({});
        await mongoose.connection.close();
    });

    describe('Notes API', () => {
        describe('POST /notes', () => {
            it('should create a new note', async () => {
                const response = await request(app)
                    .post('/api/notes')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(mockNote);

                expect(response.status).toBe(StatusCodes.OK);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject({
                    title: mockNote.title,
                    content: mockNote.content,
                    tags: mockNote.tags
                });

                noteId = response.body.data._id;
            });

            it('should fail without authentication', async () => {
                const response = await request(app)
                    .post('/api/notes')
                    .send(mockNote);

                expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
            });
        });

        describe('GET /notes', () => {
            beforeEach(async () => {
                await NoteModel.create([
                    { ...mockNote, owner: userId },
                    { ...mockNote, title: 'Second Note', owner: userId }
                ]);
            });

            it('should get all notes for authenticated user', async () => {
                const response = await request(app)
                    .get('/api/notes')
                    .set('Authorization', `Bearer ${authToken}`)
                    .query({ page: 1, perPage: 10 });

                expect(response.status).toBe(StatusCodes.OK);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toHaveLength(2);
                expect(response.body.meta).toBeDefined();
            });

            it('should paginate notes correctly', async () => {
                const response = await request(app)
                    .get('/api/notes')
                    .set('Authorization', `Bearer ${authToken}`)
                    .query({ page: 1, perPage: 1 });

                expect(response.status).toBe(StatusCodes.OK);
                expect(response.body.data).toHaveLength(1);
                expect(response.body.meta.totalPages).toBe(2);
            });
        });

        describe('GET /notes/:id', () => {
            beforeEach(async () => {
                const note = await NoteModel.create({ ...mockNote, owner: userId });
                noteId = note._id.toString();
            });

            it('should get note by id', async () => {
                const response = await request(app)
                    .get(`/api/notes/${noteId}`)
                    .set('Authorization', `Bearer ${authToken}`);

                expect(response.status).toBe(StatusCodes.OK);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject({
                    title: mockNote.title,
                    content: mockNote.content
                });
            });

            it('should return 404 for non-existent note', async () => {
                const response = await request(app)
                    .get(`/api/notes/${new mongoose.Types.ObjectId()}`)
                    .set('Authorization', `Bearer ${authToken}`);

                expect(response.status).toBe(StatusCodes.NOT_FOUND);
            });
        });

        describe('PATCH /notes/:id', () => {
            beforeEach(async () => {
                const note = await NoteModel.create({ ...mockNote, owner: userId });
                noteId = note._id.toString();
            });

            it('should update note', async () => {
                const updateData = {
                    title: 'Updated Title',
                    content: 'Updated Content'
                };

                const response = await request(app)
                    .patch(`/api/notes/${noteId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(updateData);

                expect(response.status).toBe(StatusCodes.OK);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject(updateData);
            });
        });

        describe('DELETE /notes/:id', () => {
            beforeEach(async () => {
                const note = await NoteModel.create({ ...mockNote, owner: userId });
                noteId = note._id.toString();
            });

            it('should delete note', async () => {
                const response = await request(app)
                    .delete(`/api/notes/${noteId}`)
                    .set('Authorization', `Bearer ${authToken}`);

                expect(response.status).toBe(StatusCodes.OK);
                expect(response.body.success).toBe(true);

                const note = await NoteModel.findById(noteId);
                expect(note).toBeNull();
            });
        });
    });

    describe('Search API', () => {
        beforeEach(async () => {
            await NoteModel.create([
                { ...mockNote, owner: userId },
                { title: 'Searchable Note', content: 'This is searchable content', owner: userId },
                { title: 'Another Note', content: 'Different content', owner: userId }
            ]);
        });

        describe('GET /search', () => {
            it('should search notes successfully', async () => {
                const response = await request(app)
                    .get('/api/search')
                    .set('Authorization', `Bearer ${authToken}`)
                    .query({ q: 'searchable', page: 1, perPage: 10 });

                expect(response.status).toBe(StatusCodes.OK);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toHaveLength(1);
                expect(response.body.data[0].title).toBe('Searchable Note');
            });

            it('should return 400 without search query', async () => {
                const response = await request(app)
                    .get('/api/search')
                    .set('Authorization', `Bearer ${authToken}`)
                    .query({ page: 1, perPage: 10 });

                expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            });

            it('should return empty array for no matches', async () => {
                const response = await request(app)
                    .get('/api/search')
                    .set('Authorization', `Bearer ${authToken}`)
                    .query({ q: 'nonexistent', page: 1, perPage: 10 });

                expect(response.status).toBe(StatusCodes.OK);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toHaveLength(0);
            });
        });
    });
}); 