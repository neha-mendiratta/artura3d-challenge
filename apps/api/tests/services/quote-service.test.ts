import { ConflictError, NotFoundError } from '../../src/errors';
import { ManufacturingPacket } from '../../src/models/manufacturing-packet';
import { Quote } from '../../src/models/quote';
import { createQuote } from '../../src/services/quote-service';
import { insertOrder, insertSubmittedOrder, resetDatabase } from '../helpers/db';
import { missingId } from '../helpers/fixtures';

beforeEach(resetDatabase);

describe('createQuote', () => {
  test('creates a quote and a packet', async () => {
    const order = await insertSubmittedOrder();
    const { quote, created } = await createQuote(order.id);
    expect(created).toBe(true);
    expect(quote.totalCents).toBe(15225);
    const packet = await ManufacturingPacket.findOne({ where: { orderId: order.id } });
    expect(packet?.status).toBe('Pending');
  });

  test('returns the existing quote', async () => {
    const order = await insertSubmittedOrder();
    const first = await createQuote(order.id);
    const second = await createQuote(order.id);
    expect(second).toMatchObject({ created: false, quote: { id: first.quote.id } });
    expect(await ManufacturingPacket.count({ where: { orderId: order.id } })).toBe(1);
  });

  test('creates one quote for concurrent requests', async () => {
    const order = await insertSubmittedOrder();
    const results = await Promise.all([createQuote(order.id), createQuote(order.id)]);
    expect(results.filter((result) => result.created)).toHaveLength(1);
    expect(await Quote.count({ where: { orderId: order.id } })).toBe(1);
    expect(await ManufacturingPacket.count({ where: { orderId: order.id } })).toBe(1);
  });

  test('rejects quoting a draft order', async () => {
    const order = await insertOrder();
    await expect(createQuote(order.id)).rejects.toBeInstanceOf(ConflictError);
    expect(await Quote.count()).toBe(0);
  });

  test('rejects quoting a missing order', async () => {
    await expect(createQuote(missingId)).rejects.toBeInstanceOf(NotFoundError);
  });
});
