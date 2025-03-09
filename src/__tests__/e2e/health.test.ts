import request from 'supertest';
import app from '../../../src/app';
import { StatusCodes } from 'http-status-codes';
import constants from '@utils/constants';

const { API_PREFIX } = constants;

describe('Health Check', () => {
    it('should return 200 OK for the root endpoint', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Welcome to Notes API');
    });

    it('should return 404 for non-existent endpoints', async () => {
        const response = await request(app).get('/non-existent');
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent API endpoints', async () => {
        const response = await request(app).get(`${API_PREFIX}/non-existent`);
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.body.success).toBe(false);
    });
}); 