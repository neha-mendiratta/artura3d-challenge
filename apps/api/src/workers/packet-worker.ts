import { ConnectionError } from 'sequelize';
import { PACKET_FAILED_MESSAGE, PACKET_POLL_INTERVAL_MS } from '../constants';
import { sequelize } from '../db';
import { logger } from '../logger';
import { ManufacturingPacket } from '../models/manufacturing-packet';
import { Order } from '../models/order';
import { Quote } from '../models/quote';
import { buildPacketPayload } from '../services/packet-payload';

// Processes the oldest Pending packet; returns false when there is none.
// The row is locked and other workers skip it, so a packet is never processed twice.
// If processing stops mid-way or the database connection fails, the transaction rolls back and
// the packet stays Pending, so the next poll tries again. Any other error is permanent: Failed.
// The details go to the log only; the packet keeps a plain message that is safe to show users.
export async function processNextPacket(): Promise<boolean> {
  let packetId: string | undefined;
  try {
    return await sequelize.transaction(async (transaction) => {
      const packet = await ManufacturingPacket.findOne({
        where: { status: 'Pending' },
        order: [['id', 'ASC']],
        lock: true,
        skipLocked: true,
        transaction,
      });
      if (!packet) return false;
      packetId = packet.id;

      const order = await Order.findByPk(packet.orderId, {
        include: { model: Quote, as: 'quote' },
        rejectOnEmpty: true,
        transaction,
      });
      await packet.update({ status: 'Completed', payload: buildPacketPayload(order) }, { transaction });
      return true;
    });
  } catch (err) {
    if (!packetId || err instanceof ConnectionError) throw err;
    logger.error({ err, packetId }, 'Manufacturing packet failed');
    await ManufacturingPacket.update(
      { status: 'Failed', error: PACKET_FAILED_MESSAGE },
      { where: { id: packetId, status: 'Pending' } },
    );
    return true;
  }
}

// Every interval, processes all Pending packets, then waits. Returns a function that stops it.
export function startPacketWorker(): () => void {
  let stopped = false;
  let timer: NodeJS.Timeout | undefined;

  const run = async () => {
    try {
      while (!stopped && (await processNextPacket())) {
        // keep going until no Pending packet is left
      }
    } catch (err) {
      logger.error({ err }, 'Packet worker error');
    }
    if (!stopped) timer = setTimeout(run, PACKET_POLL_INTERVAL_MS);
  };

  void run();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
