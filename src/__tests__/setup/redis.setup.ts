import { client } from '@configs/redis.config';

beforeAll(async () => {
    try {
        await client.connect();
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
});

afterAll(async () => {
    try {
        await client.quit();
    } catch (error) {
        console.error('Error closing Redis connection:', error);
    }
}); 