import { app } from './app';
import { config } from './config';
import { logger } from './logger';
import { startPacketWorker } from './workers/packet-worker';

app.listen(config.port, () => logger.info({ port: config.port }, 'API listening'));
startPacketWorker();
