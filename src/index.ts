import { registerAliases } from './configs/paths.config';
registerAliases();

import http from 'http';
import constants from '@utils/constants';
import database from '@configs/database.config';
import redisClient from '@configs/redis.config';
import { Logger } from '@configs/winston.config';
import app from './app';

const { NODE, DEFAULTS } = constants;

const port = NODE.port ?? DEFAULTS.port;

const server: http.Server = http.createServer(app);

const startServer = (): void => {
    try {
        server.listen(port, '0.0.0.0', () => {
            Logger.info(`🚀 Server is running on port ${port}...`);
        });
    } catch (error: unknown) {
        Logger.error('Server failed to start...', error);
        process.exit(1);
    }
};

const gracefulShutdown = async () => {
    await redisClient.disconnect();
    database.disconnect();
    server.close();
    Logger.info('👋 Server is shutting down...');
    process.exit(0);
};

const start = async (): Promise<void> => {
    try {
        await database.connect();
        await redisClient.connect();
        startServer();

        const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const;
        signals.forEach(signal => {
            process.on(signal, gracefulShutdown);
        });
    } catch (error) {
        Logger.error('Failed to start application:', error);
        process.exit(1);
    }
};

start();

export default server;
