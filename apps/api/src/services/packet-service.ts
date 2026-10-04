import { NotFoundError } from '../errors';
import { ManufacturingPacket } from '../models/manufacturing-packet';
import { getOrder } from './order-service';

export async function getPacket(orderId: string): Promise<ManufacturingPacket> {
  await getOrder(orderId);
  const packet = await ManufacturingPacket.findOne({ where: { orderId } });
  if (!packet) {
    throw new NotFoundError('This order has no manufacturing packet yet');
  }
  return packet;
}
