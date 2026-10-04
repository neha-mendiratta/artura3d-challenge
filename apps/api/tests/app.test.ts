import request from 'supertest';
import { app } from '../src/app';

describe('app', () => {
  test('does not reveal the framework in response headers', async () => {
    const res = await request(app).get('/orders');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
