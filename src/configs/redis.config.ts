import { createClient } from 'redis';
import constants from '@utils/constants';
import { Logger } from '@configs/winston.config';

const { REDIS_URL } = constants;

if (!REDIS_URL) {
    throw new Error('REDIS_URL is not defined');
}

export const client = createClient({ url: REDIS_URL });

const connect = async (): Promise<void> => {
    try {
        await client.connect();
        Logger.info('Connected to redis successfully...');
    } catch (error: unknown) {
        Logger.error('Redis connection failed:', error);
        process.exit(1);
    }
};

const disconnect = async (): Promise<void> => {
    await client.disconnect();
};

const redisClient = {
    connect,
    disconnect,
};

export default redisClient;
