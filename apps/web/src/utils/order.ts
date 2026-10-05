import { OrderInput } from '@artura/shared';
import { Order } from '../types';

// The editable fields of an order, as the form and the API's PUT expect them.
export function toOrderInput(order: Order): OrderInput {
  const { patientRef, lengthMm, widthMm, thicknessMm, colour, expedite, notes } = order;
  return { patientRef, lengthMm, widthMm, thicknessMm, colour, expedite, notes };
}
