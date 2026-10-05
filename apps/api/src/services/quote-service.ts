import { UniqueConstraintError } from 'sequelize';
import { sequelize } from '../db';
import { ConflictError } from '../errors';
import { ManufacturingPacket } from '../models/manufacturing-packet';
import { Quote } from '../models/quote';
import { calculatePriceCents } from '../pricing';
import { QuoteResult } from '../types';
import { getOrder } from './order-service';

// Idempotent: the first call creates the quote and its Pending packet atomically; later calls
// return the same quote. The unique order_id prevents duplicates, including for concurrent requests.
export async function createQuote(orderId: string): Promise<QuoteResult> {
  const order = await getOrder(orderId);
  if (order.status !== 'Submitted') {
    throw new ConflictError('Only Submitted orders can be quoted');
  }

  try {
    const quote = await sequelize.transaction(async (transaction) => {
      const newQuote = await Quote.create({ orderId, totalCents: calculatePriceCents(order) }, { transaction });
      await ManufacturingPacket.create({ orderId }, { transaction });
      return newQuote;
    });
    return { quote, created: true };
  } catch (err) {
    if (!(err instanceof UniqueConstraintError)) throw err;
    const existing = await Quote.findOne({ where: { orderId }, rejectOnEmpty: true });
    return { quote: existing, created: false };
  }
}
