import { logger } from '../../src/logger';
import { ManufacturingPacket } from '../../src/models/manufacturing-packet';
import * as packetPayload from '../../src/services/packet-payload';
import { processNextPacket, startPacketWorker } from '../../src/workers/packet-worker';
import { insertQuotedOrder, resetDatabase } from '../helpers/db';

const findPacket = (orderId: string) => ManufacturingPacket.findOne({ where: { orderId }, rejectOnEmpty: true });

beforeEach(resetDatabase);
afterEach(() => jest.restoreAllMocks());

describe('processNextPacket', () => {
  test('completes a pending packet', async () => {
    const order = await insertQuotedOrder();
    expect(await processNextPacket()).toBe(true);

    const packet = await findPacket(order.id);
    expect(packet).toMatchObject({ status: 'Completed', error: null });
    expect(packet.payload).toMatchObject({ orderId: order.id, patientRef: order.patientRef, quote: { totalCents: 15225 } });
  });

  test('does nothing when no packet is pending', async () => {
    expect(await processNextPacket()).toBe(false);
  });

  test('marks the packet failed on error', async () => {
    const order = await insertQuotedOrder();
    jest.spyOn(packetPayload, 'buildPacketPayload').mockImplementationOnce(() => {
      throw new Error('Payload could not be built');
    });
    const logError = jest.spyOn(logger, 'error');

    await processNextPacket();

    const packet = await findPacket(order.id);
    expect(packet).toMatchObject({ status: 'Failed', error: 'Payload could not be built', payload: null });
    expect(logError).toHaveBeenCalled();
  });

  test('processes a packet only once with two workers', async () => {
    const order = await insertQuotedOrder();
    const results = await Promise.all([processNextPacket(), processNextPacket()]);
    expect(results.sort()).toEqual([false, true]);
    expect((await findPacket(order.id)).status).toBe('Completed');
  });

  test('does not reprocess finished packets', async () => {
    const order = await insertQuotedOrder();
    await processNextPacket();
    const { updatedAt } = await findPacket(order.id);

    expect(await processNextPacket()).toBe(false);
    expect((await findPacket(order.id)).updatedAt).toEqual(updatedAt);
  });
});

describe('startPacketWorker', () => {
  test('processes packets in the background', async () => {
    const order = await insertQuotedOrder();
    const stop = startPacketWorker();
    try {
      for (let i = 0; i < 50 && (await findPacket(order.id)).status === 'Pending'; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      expect((await findPacket(order.id)).status).toBe('Completed');
    } finally {
      stop();
    }
  });
});
