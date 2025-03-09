import mongoose from 'mongoose';
import { RedisClientType, createClient } from 'redis';
import database from '@configs/database.config';

let redisClient: RedisClientType;

beforeAll(async () => {
    try {
        await database.connect();
        redisClient = createClient({ url: process.env.REDIS_URL });
        await redisClient.connect();
    } catch (error) {
        console.error('Test setup failed:', error);
        throw error;
    }
});
afterEach(async () => {
    try {
        if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
            const collections = await mongoose.connection.db.collections();
            await Promise.all(
                collections.map(collection => collection.deleteMany({}))
            );
        }

        if (redisClient?.isReady) {
            await redisClient.flushDb();
        }
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
});

afterAll(async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        if (redisClient?.isReady) {
            await redisClient.quit();
        }
    } catch (error) {
        console.error('Teardown failed:', error);
    }
}); 