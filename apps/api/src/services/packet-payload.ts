import { Order } from '../models/order';

// The JSON sent to manufacturing: the order as submitted plus its quote.
export function buildPacketPayload(order: Order) {
  if (!order.quote) {
    throw new Error(`Order ${order.id} has no quote`);
  }
  return {
    orderId: order.id,
    patientRef: order.patientRef,
    lengthMm: order.lengthMm,
    widthMm: order.widthMm,
    thicknessMm: order.thicknessMm,
    colour: order.colour,
    expedite: order.expedite,
    notes: order.notes,
    submittedAt: order.submittedAt,
    quote: { id: order.quote.id, totalCents: order.quote.totalCents },
    generatedAt: new Date(),
  };
}
