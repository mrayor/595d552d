import mongoose from 'mongoose';
import database from '@configs/database.config';
import constants from '@utils/constants';

const { DATABASE_URL } = constants;

describe('Database Connection', () => {
    beforeEach(async () => {
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
            }
        } catch (error) {
            console.error('Error closing connection:', error);
        }
    });

    it('should connect to the test database successfully', async () => {
        const db = await database.connect();
        expect(db).toBeDefined();
        expect(mongoose.connection.readyState).toBe(1);
        expect(mongoose.connection.name).toBe('notes-test');
        expect(DATABASE_URL).toContain('notes-test');
    });

    it('should disconnect from the database successfully', async () => {
        await database.connect();
        await database.disconnect();
        expect(mongoose.connection.readyState).toBe(0);
    });

    it('should handle connection errors gracefully', async () => {
        const unreachableDb = mongoose.createConnection('mongodb://unreachable-host:27017/test', {
            serverSelectionTimeoutMS: 1000
        });

        await expect(unreachableDb.asPromise()).rejects.toThrow();
        await unreachableDb.close();
    });

    afterAll(async () => {
        try {
            await mongoose.connection.close();
        } catch (error) {
            console.error('Error closing connection in afterAll:', error);
        }
    });
}); 