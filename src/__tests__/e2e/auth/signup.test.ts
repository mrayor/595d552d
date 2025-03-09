import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../../app';
import constants from '@utils/constants';
import UserModel from '@models/user.model';

const { API_PREFIX } = constants;

describe('Auth - Signup', () => {
    const validUser = {
        email: 'test@user.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
    };

    beforeEach(async () => {
        await UserModel.deleteMany({});
    });

    it('should create a new user successfully', async () => {
        const response = await request(app)
            .post(`${API_PREFIX}/auth/signup`)
            .send(validUser);

        expect(response.status).toBe(StatusCodes.CREATED);
        expect(response.body.success).toBe(true);
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