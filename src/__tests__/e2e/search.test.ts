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

describe('Search API - E2E Tests', () => {
    let authToken: string;
    let userId: string;

    const mockUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
    };

    const mockNotes = [
        { title: 'Test Note', content: 'This is a test note', tags: ['test', 'first'] },
        { title: 'Another Note', content: 'This is searchable content', tags: ['test', 'second'] },
        { title: 'Third Note', content: 'Different content', tags: ['other'] }
    ];

    beforeAll(async () => {
        await mongoose.connect(process.env.DATABASE_URL as string);
        await UserModel.deleteMany({});
        await NoteModel.deleteMany({});

        const user = await UserModel.create(mockUser);
        userId = user._id.toString();
        authToken = signJwt({
            key: JWT.accessTokenPrivateKey,
            payload: { sub: userId },
            options: { expiresIn: TokenExpiry.Access, jwtid: crypto.randomUUID() }
        });
    });

    beforeEach(async () => {
        await NoteModel.deleteMany({});
        // Create test notes
        await Promise.all(mockNotes.map(note =>
            NoteModel.create({ ...note, owner: new mongoose.Types.ObjectId(userId) })
        ));
    });

    afterAll(async () => {
        await UserModel.deleteMany({});
        await NoteModel.deleteMany({});
        await mongoose.connection.close();
    });

    describe('GET /search', () => {
        it('should search notes by title and content containing "test"', async () => {
            const response = await request(app)
                .get('/api/search')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ q: 'Test', page: 1, perPage: 10 });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data.some((note: any) => note.title === 'Test Note')).toBe(true);
            expect(response.body.data.some((note: any) => note.title === 'Another Note')).toBe(true);
        });

        it('should search notes by content', async () => {
            const response = await request(app)
                .get('/api/search')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ q: 'searchable', page: 1, perPage: 10 });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].title).toBe('Another Note');
        });

        it('should search notes by tags', async () => {
            const response = await request(app)
                .get('/api/search')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ q: 'first', page: 1, perPage: 10 });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].tags).toContain('first');
        });

        it('should return multiple results for common terms', async () => {
            const response = await request(app)
                .get('/api/search')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ q: 'test', page: 1, perPage: 10 });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data.some((note: any) => note.title === 'Test Note')).toBe(true);
            expect(response.body.data.some((note: any) => note.title === 'Another Note')).toBe(true);
        });

        it('should paginate search results', async () => {
            const response = await request(app)
                .get('/api/search')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ q: 'test', page: 1, perPage: 1 });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.meta.totalPages).toBeGreaterThan(1);
        });

        it('should return 400 when search query is missing', async () => {
            const response = await request(app)
                .get('/api/search')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ page: 1, perPage: 10 });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Search query is required');
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

        it('should require authentication', async () => {
            const response = await request(app)
                .get('/api/search')
                .query({ q: 'test', page: 1, perPage: 10 });

            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });
    });
}); 