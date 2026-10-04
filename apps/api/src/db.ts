import { Sequelize } from 'sequelize';
import { config } from './config';
import { logger } from './logger';

export const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: (sql) => logger.debug(sql),
});
