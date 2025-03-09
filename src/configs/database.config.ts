import mongoose from 'mongoose';
import constants from '@utils/constants';
import { Logger } from '@configs/winston.config';

const { DATABASE_URL, NODE, ENV } = constants;

const connect = async (): Promise<mongoose.Connection> => {
    try {
        if (!DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }

        mongoose.set('strictQuery', NODE.env === ENV.production);
        mongoose.set('debug', NODE.env === ENV.development);

        await mongoose.connect(DATABASE_URL);
        Logger.info('Connected to database successfully...');

        mongoose.Promise = global.Promise;
        const db: mongoose.Connection = mongoose.connection;
        return db;
    } catch (error) {
        Logger.error('Database connection error: ', error);
        throw error;
    }
};

const disconnect = async (): Promise<void> => {
    await mongoose.connection.close();
};

const database = {
    connect,
    disconnect,
};

export default database;
