import request from 'supertest';
import { app } from '../../src/app';
import { Order } from '../../src/models/order';
import { missingId, validOrder } from '../helpers/fixtures';
import { insertOrder, insertSubmittedOrder, resetDatabase } from '../helpers/db';

beforeEach(resetDatabase);

describe('orders API', () => {
  test('lists orders', async () => {
    const order = await insertOrder();
    const res = await request(app).get('/orders').expect(200);
    expect(res.body).toMatchObject({ items: [{ id: order.id, quote: null }], nextCursor: null });
  });

  test('rejects an invalid list query', async () => {
    await request(app).get('/orders?status=Foo').expect(400);
    await request(app).get('/orders?cursor=abc').expect(400);
  });

  test('creates an order', async () => {
    const res = await request(app)
      .post('/orders')
      .send({ ...validOrder, colour: '#3366ff', notes: '  ' })
      .expect(201);
    expect(res.body).toMatchObject({
      ...validOrder,
      colour: '#3366FF',
      notes: null,
      expedite: false,
      status: 'Draft',
      quote: null,
    });
  });

  test('returns an order by id', async () => {
    const order = await insertOrder();
    const res = await request(app).get(`/orders/${order.id}`).expect(200);
    expect(res.body).toMatchObject({ id: order.id, ...validOrder });
  });

  test('updates an order', async () => {
    const order = await insertOrder();
    const res = await request(app).put(`/orders/${order.id}`).send({ ...validOrder, widthMm: 100 }).expect(200);
    expect(res.body.widthMm).toBe(100);
  });

  test('submits an order', async () => {
    const order = await insertOrder();
    const res = await request(app).post(`/orders/${order.id}/submit`).expect(200);
    expect(res.body).toMatchObject({ status: 'Submitted', submittedAt: expect.any(String) });
  });

  test('returns 409 when submitting twice', async () => {
    const { id } = await insertSubmittedOrder();
    const res = await request(app).post(`/orders/${id}/submit`).expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('updates notes after submit', async () => {
    const { id } = await insertSubmittedOrder();
    const res = await request(app).patch(`/orders/${id}/notes`).send({ notes: 'Left foot only' }).expect(200);
    expect(res.body).toMatchObject({ notes: 'Left foot only', status: 'Submitted' });
  });

  test('returns 404 when updating the notes of a missing order', async () => {
    const res = await request(app).patch(`/orders/${missingId}/notes`).send({ notes: 'Left foot only' }).expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('rejects a missing field', async () => {
    const { patientRef, ...withoutPatientRef } = validOrder;
    const res = await request(app).post('/orders').send(withoutPatientRef).expect(400);
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(res.body.error.message).toContain('patientRef');
  });

  test('rejects an invalid dimension', async () => {
    await request(app).post('/orders').send({ ...validOrder, widthMm: 200 }).expect(400);
    await request(app).post('/orders').send({ ...validOrder, thicknessMm: 3.55 }).expect(400);
  });

  test('rejects an invalid colour', async () => {
    await request(app).post('/orders').send({ ...validOrder, colour: 'blue' }).expect(400);
  });

  test('rejects unknown fields', async () => {
    await request(app).post('/orders').send({ ...validOrder, status: 'Submitted' }).expect(400);
  });

  test('rejects wrong types', async () => {
    await request(app).post('/orders').send({ ...validOrder, widthMm: '90' }).expect(400);
    await request(app).post('/orders').send({ ...validOrder, expedite: 'true' }).expect(400);
  });

  test('rejects invalid JSON', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Content-Type', 'application/json')
      .send('{ not json')
      .expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('rejects an invalid id', async () => {
    await request(app).get('/orders/123').expect(400);
  });

  test('returns 404 for a missing order', async () => {
    const res = await request(app).get(`/orders/${missingId}`).expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('validates the body before checking status', async () => {
    const { id } = await insertSubmittedOrder();
    await request(app).put(`/orders/${id}`).send({ ...validOrder, widthMm: 200 }).expect(400);
  });

  test('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/order/123').expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('hides internal errors', async () => {
    jest.spyOn(Order, 'findByPk').mockRejectedValueOnce(new Error('connection lost'));
    const res = await request(app).get(`/orders/${missingId}`).expect(500);
    expect(res.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
  });
});
