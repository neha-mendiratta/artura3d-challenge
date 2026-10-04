import request from 'supertest';
import { app } from '../../src/app';
import { insertOrder, insertSubmittedOrder, resetDatabase } from '../helpers/db';

beforeEach(resetDatabase);

describe('quote API', () => {
  test('returns 201 for a new quote and 200 with the same quote after', async () => {
    const order = await insertSubmittedOrder();
    const first = await request(app).post(`/orders/${order.id}/quote`).expect(201);
    expect(first.body).toMatchObject({ orderId: order.id, totalCents: 15225 });

    const second = await request(app).post(`/orders/${order.id}/quote`).expect(200);
    expect(second.body.id).toBe(first.body.id);
  });

  test('returns 409 when quoting a draft order', async () => {
    const order = await insertOrder();
    const res = await request(app).post(`/orders/${order.id}/quote`).expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('includes the quote in the order', async () => {
    const order = await insertSubmittedOrder();
    await request(app).post(`/orders/${order.id}/quote`).expect(201);
    const res = await request(app).get(`/orders/${order.id}`).expect(200);
    expect(res.body.quote).toMatchObject({ totalCents: 15225 });
  });
});
