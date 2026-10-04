import { sequelize } from '../../src/db';
import { Order } from '../../src/models/order';
import { validOrder } from './fixtures';

export async function resetDatabase(): Promise<void> {
  await sequelize.query('TRUNCATE manufacturing_packets, quotes, orders');
}

export function insertOrder(values: Partial<{ thicknessMm: number }> = {}): Promise<Order> {
  return Order.create({ ...validOrder, ...values });
}

export async function insertSubmittedOrder(): Promise<Order> {
  const order = await insertOrder();
  return order.update({ status: 'Submitted', submittedAt: new Date() });
}
