import express from 'express';
import { pinoHttp } from 'pino-http';
import { NotFoundError } from './errors';
import { logger } from './logger';
import { errorHandler } from './middleware/error-handler';
import { orderRoutes } from './routes/order-routes';

export const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());

app.use('/orders', orderRoutes);

app.use((_req, _res, next) => next(new NotFoundError('Route not found')));
app.use(errorHandler);
