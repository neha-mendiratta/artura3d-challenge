import express from 'express';
import { pinoHttp } from 'pino-http';
import { NotFoundError } from './errors';
import { logger } from './logger';
import { errorHandler } from './middleware/error-handler';
import { orderRoutes } from './routes/order-routes';
import { packetRoutes } from './routes/packet-routes';
import { quoteRoutes } from './routes/quote-routes';

export const app = express();

app.disable('x-powered-by');

// One short line per request: method, URL, status and response time (no headers).
app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req) => ({ method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);
app.use(express.json());

app.use('/orders', orderRoutes, quoteRoutes, packetRoutes);

app.use((_req, _res, next) => next(new NotFoundError('Route not found')));
app.use(errorHandler);
