import { Order } from '../../src/models/order';
import { Quote } from '../../src/models/quote';
import { buildPacketPayload } from '../../src/services/packet-payload';
import { validOrder } from '../helpers/fixtures';

describe('buildPacketPayload', () => {
  test('builds the payload from the order and quote', () => {
    const submittedAt = new Date('2026-10-04T09:21:40.117Z');
    const order = Order.build({ ...validOrder, id: 'order-1', expedite: true, notes: null, submittedAt });
    order.quote = Quote.build({ id: 'quote-1', orderId: 'order-1', totalCents: 17509 });

    expect(buildPacketPayload(order)).toEqual({
      orderId: 'order-1',
      ...validOrder,
      expedite: true,
      notes: null,
      submittedAt,
      quote: { id: 'quote-1', totalCents: 17509 },
      generatedAt: expect.any(Date),
    });
  });

  test('throws when the order has no quote', () => {
    const order = Order.build({ ...validOrder, id: 'order-1' });
    expect(() => buildPacketPayload(order)).toThrow('has no quote');
  });
});
