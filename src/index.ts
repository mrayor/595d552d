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
        server.listen(port, () => {
            Logger.info(`🚀 Server is running at http://localhost:${port}...`);
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
    await database.connect();
    await redisClient.connect();
    startServer();

    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const;

    for (let i = 0; i < signals.length; i += 1) {
        const signal = signals[i];
        process.on(signal, () => {
            gracefulShutdown();
        });
    }
};

start();

export default server;
