import { sequelize } from '../../src/db';
import { Order } from '../../src/models/order';
import { createQuote } from '../../src/services/quote-service';
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

// A submitted order with its quote and Pending packet.
export async function insertQuotedOrder(): Promise<Order> {
  const order = await insertSubmittedOrder();
  await createQuote(order.id);
  return order;
}
