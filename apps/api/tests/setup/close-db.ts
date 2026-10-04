import { sequelize } from '../../src/db';

afterAll(() => sequelize.close());
