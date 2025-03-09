import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const levels = {
    debug: 4,
    error: 0,
    http: 3,
    info: 2,
    warn: 1,
};

const colors = {
    debug: 'white',
    error: 'red',
    http: 'magenta',
    info: 'green',
    warn: 'yellow',
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const transports = [
    new winston.transports.Console(),
    new DailyRotateFile({
        datePattern: 'YYYY-MM-DD',
        filename: 'logs/application-%DATE%.log',
        maxFiles: '7d',
        maxSize: '20m',
        zippedArchive: true,
    }),
];

export const Logger = winston.createLogger({
    format,
    level: 'debug',
    levels,
    transports,
});
