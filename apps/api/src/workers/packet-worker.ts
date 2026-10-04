import { PACKET_POLL_INTERVAL_MS } from '../constants';
import { sequelize } from '../db';
import { logger } from '../logger';
import { ManufacturingPacket } from '../models/manufacturing-packet';
import { Order } from '../models/order';
import { Quote } from '../models/quote';
import { buildPacketPayload } from '../services/packet-payload';

// Processes the oldest Pending packet; returns false when there is none.
// The row is locked and other workers skip it, so a packet is never processed twice.
// If processing stops mid-way, the transaction rolls back and the packet stays Pending.
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
    if (!packetId) throw err;
    logger.error({ err, packetId }, 'Manufacturing packet failed');
    const message = err instanceof Error ? err.message : String(err);
    await ManufacturingPacket.update({ status: 'Failed', error: message }, { where: { id: packetId, status: 'Pending' } });
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
