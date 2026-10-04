import { NotFoundError } from '../../src/errors';
import { getPacket } from '../../src/services/packet-service';
import { createQuote } from '../../src/services/quote-service';
import { insertSubmittedOrder, resetDatabase } from '../helpers/db';
import { missingId } from '../helpers/fixtures';

beforeEach(resetDatabase);

describe('getPacket', () => {
  test('returns the packet of a quoted order', async () => {
    const order = await insertSubmittedOrder();
    await createQuote(order.id);
    const packet = await getPacket(order.id);
    expect(packet).toMatchObject({ orderId: order.id, status: 'Pending' });
  });

  test('returns 404 when no packet exists', async () => {
    const order = await insertSubmittedOrder();
    await expect(getPacket(order.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  test('rejects a missing order', async () => {
    await expect(getPacket(missingId)).rejects.toBeInstanceOf(NotFoundError);
  });
});
