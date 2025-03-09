import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../../app';
import constants from '@utils/constants';
import UserModel from '@models/user.model';
import { Cookies } from '../../../types';

const { API_PREFIX } = constants;

interface SuperTestResponse extends Omit<request.Response, 'headers'> {
    headers: {
        'set-cookie'?: string[];
        [key: string]: string | string[] | undefined;
    };
}

describe('Auth Routes', () => {
    const validUser = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
    };

    beforeEach(async () => {
        await UserModel.deleteMany({});
    });

    describe('POST /signup', () => {
        it('should create a new user successfully', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send(validUser) as SuperTestResponse;

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.success).toBe(true);
            expect(response.headers['set-cookie']?.some(cookie => cookie.includes(Cookies.AccessToken))).toBe(true);
            expect(response.headers['set-cookie']?.some(cookie => cookie.includes(Cookies.RefreshToken))).toBe(true);
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send({ ...validUser, email: 'invalid-email' });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for weak password', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send({ ...validUser, password: 'weak' });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.success).toBe(false);
        });

        it('should return 409 for duplicate email', async () => {
            await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send(validUser);

            const response = await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send(validUser);

            expect(response.status).toBe(StatusCodes.CONFLICT);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send({});

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /login', () => {
        beforeEach(async () => {
            await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send(validUser);
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/login`)
                .send({
                    email: validUser.email,
                    password: validUser.password
                }) as SuperTestResponse;

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.success).toBe(true);
            expect(response.headers['set-cookie']?.some(cookie => cookie.includes(Cookies.AccessToken))).toBe(true);
            expect(response.headers['set-cookie']?.some(cookie => cookie.includes(Cookies.RefreshToken))).toBe(true);
        });

        it('should return 401 for invalid credentials', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/login`)
                .send({
                    email: validUser.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /logout', () => {
        let accessToken: string;
        let refreshToken: string;

        beforeEach(async () => {
            await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send(validUser);

            const loginResponse = await request(app)
                .post(`${API_PREFIX}/auth/login`)
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            accessToken = loginResponse.body.data.accessToken;
            refreshToken = loginResponse.body.data.refreshToken;
        });

        it('should logout successfully with valid tokens', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/logout`)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('x-refresh-token', refreshToken) as SuperTestResponse;

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.success).toBe(true);
            expect(response.headers['set-cookie']?.some(cookie => cookie.includes(`${Cookies.AccessToken}=;`))).toBe(true);
            expect(response.headers['set-cookie']?.some(cookie => cookie.includes(`${Cookies.RefreshToken}=;`))).toBe(true);
        });
    });

    describe('POST /refresh-token', () => {
        let refreshToken: string;

        beforeEach(async () => {
            await request(app)
                .post(`${API_PREFIX}/auth/signup`)
                .send(validUser);

            const loginResponse = await request(app)
                .post(`${API_PREFIX}/auth/login`)
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            refreshToken = loginResponse.body.data.refreshToken;
        });

        it('should refresh access token successfully', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/refresh-token`)
                .set('x-refresh-token', refreshToken) as SuperTestResponse;

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.headers['set-cookie']?.some(cookie => cookie.includes(Cookies.AccessToken))).toBe(true);
        });

        it('should return 401 for invalid refresh token', async () => {
            const response = await request(app)
                .post(`${API_PREFIX}/auth/refresh-token`)
                .set('x-refresh-token', 'invalid-token');

            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
            expect(response.body.success).toBe(false);
        });
    });
});