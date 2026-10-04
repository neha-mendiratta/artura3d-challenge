import { OrderInput } from '@artura/shared';
import { InferAttributes } from 'sequelize';
import { ConflictError, NotFoundError } from '../errors';
import { Order } from '../models/order';
import { Quote } from '../models/quote';

export async function getOrder(id: string): Promise<Order> {
  const order = await Order.findByPk(id, { include: { model: Quote, as: 'quote' } });
  if (!order) {
    throw new NotFoundError(`Order ${id} not found`);
  }
  return order;
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const order = await Order.create(input);
  return getOrder(order.id);
}

// The status check is part of the UPDATE's WHERE clause, so two requests at the same time
// cannot both succeed. No row updated means the order is missing (404) or not a Draft (409).
async function updateDraft(
  id: string,
  values: Partial<InferAttributes<Order>>,
  conflictMessage: string,
): Promise<Order> {
  const [updated] = await Order.update(values, { where: { id, status: 'Draft' } });
  if (updated === 0) {
    await getOrder(id);
    throw new ConflictError(conflictMessage);
  }
  return getOrder(id);
}

export function updateOrder(id: string, input: OrderInput): Promise<Order> {
  return updateDraft(id, input, 'Only Draft orders can be edited');
}

export function submitOrder(id: string): Promise<Order> {
  return updateDraft(id, { status: 'Submitted', submittedAt: new Date() }, 'Order is already submitted');
}

// Notes are the only field that can change after submit.
export async function updateNotes(id: string, notes: string | null): Promise<Order> {
  const [updated] = await Order.update({ notes }, { where: { id } });
  if (updated === 0) {
    throw new NotFoundError(`Order ${id} not found`);
  }
  return getOrder(id);
}
