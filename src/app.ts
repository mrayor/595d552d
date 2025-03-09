import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import constants from '@utils/constants';
import rateLimit from 'express-rate-limit';
import router from '@routes/index';
import cookieParser from 'cookie-parser';
import { morganMiddleware } from '@middlewares/morgan.middleware';
import { validateCorsOrigin } from '@utils/helpers';
import errorHandler from '@middlewares/error.middleware';
import { notFoundHandler } from '@middlewares/notFound.middleware';
import { deserializeUser } from '@middlewares/deserializeUser.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@configs/swagger.config';

const { API_PREFIX, ORIGIN, ROUTES, NODE, ENV, JWT } = constants;
const isProduction = NODE.env === ENV.production;

const app: Express = express();
const DURATION = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

const limiter = rateLimit({
    legacyHeaders: false,
    max: MAX_REQUESTS,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    windowMs: DURATION,
});

const CORS_OPTIONS = {
    credentials: true,
    origin: (origin: string | undefined, callback: (err: Error | null, origin?: boolean) => void): void => {
        validateCorsOrigin({ origin, callback, appOrigin: ORIGIN });
    },
};

app.use(helmet());
app.use(cors(isProduction ? CORS_OPTIONS : {}));
app.use(cookieParser());
app.use(express.json());
app.use(deserializeUser({ key: JWT.accessTokenPublicKey }));
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);
app.use(limiter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(router.get(ROUTES.home));
app.use(API_PREFIX, router);
app.use(errorHandler);
app.use(notFoundHandler);

app.set('trust proxy', 1);

export default app;
