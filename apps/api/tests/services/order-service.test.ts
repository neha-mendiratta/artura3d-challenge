import { orderInputSchema } from '@artura/shared';
import { ConflictError, NotFoundError } from '../../src/errors';
import { Order } from '../../src/models/order';
import { listOrders, submitOrder, updateNotes, updateOrder } from '../../src/services/order-service';
import { insertOrder, insertSubmittedOrder, resetDatabase } from '../helpers/db';
import { missingId, validOrder } from '../helpers/fixtures';

const widerOrder = orderInputSchema.parse({ ...validOrder, widthMm: 100 });

beforeEach(resetDatabase);

describe('order workflow', () => {
  test('submits a draft order', async () => {
    const order = await insertOrder();
    const submitted = await submitOrder(order.id);
    expect(submitted.status).toBe('Submitted');
    expect(submitted.submittedAt).toBeInstanceOf(Date);
  });

  test('rejects submitting twice', async () => {
    const order = await insertSubmittedOrder();
    await expect(submitOrder(order.id)).rejects.toBeInstanceOf(ConflictError);
  });

  test('rejects submitting a missing order', async () => {
    await expect(submitOrder(missingId)).rejects.toBeInstanceOf(NotFoundError);
  });

  test('allows only one of two concurrent submits', async () => {
    const order = await insertOrder();
    const results = await Promise.allSettled([submitOrder(order.id), submitOrder(order.id)]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected')?.reason).toBeInstanceOf(ConflictError);
  });

  test('edits a draft order', async () => {
    const order = await insertOrder();
    const edited = await updateOrder(order.id, widerOrder);
    expect(edited.widthMm).toBe(100);
  });

  test('rejects editing a submitted order', async () => {
    const order = await insertSubmittedOrder();
    await expect(updateOrder(order.id, widerOrder)).rejects.toBeInstanceOf(ConflictError);
    const saved = await Order.findByPk(order.id);
    expect(saved?.widthMm).toBe(validOrder.widthMm);
  });

  test('updates notes on a submitted order', async () => {
    const order = await insertSubmittedOrder();
    const updated = await updateNotes(order.id, 'Left foot only');
    expect(updated).toMatchObject({ notes: 'Left foot only', status: 'Submitted' });
  });
});

describe('orders list', () => {
  test('pages through orders', async () => {
    const ids: string[] = [];
    for (let i = 0; i < 25; i++) {
      ids.push((await insertOrder()).id);
    }

    const first = await listOrders({});
    expect(first.items).toHaveLength(20);
    expect(first.items[0]?.id).toBe(ids[24]);

    const second = await listOrders({ cursor: first.nextCursor! });
    expect(second.items).toHaveLength(5);
    expect(second.nextCursor).toBeNull();

    const seen = [...first.items, ...second.items].map((order) => order.id);
    expect(new Set(seen).size).toBe(25);
  });

  test('filters orders by status', async () => {
    await insertOrder();
    const submitted = await insertSubmittedOrder();
    const { items } = await listOrders({ status: 'Submitted' });
    expect(items.map((order) => order.id)).toEqual([submitted.id]);
  });
});
