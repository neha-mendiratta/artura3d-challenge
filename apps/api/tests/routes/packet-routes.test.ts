import request from 'supertest';
import { app } from '../../src/app';
import { insertQuotedOrder, insertSubmittedOrder, resetDatabase } from '../helpers/db';

beforeEach(resetDatabase);

describe('packet API', () => {
  test('returns the packet', async () => {
    const order = await insertQuotedOrder();
    const res = await request(app).get(`/orders/${order.id}/packet`).expect(200);
    expect(res.body).toMatchObject({ orderId: order.id, status: 'Pending', payload: null, error: null });
  });

  test('returns 404 before the order is quoted', async () => {
    const order = await insertSubmittedOrder();
    const res = await request(app).get(`/orders/${order.id}/packet`).expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
