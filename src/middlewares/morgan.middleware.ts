import morgan, { StreamOptions } from 'morgan';
import { Logger } from '@configs/winston.config';

const stream: StreamOptions = {
    write: (message) => Logger.http(message),
};

export const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream },
);
