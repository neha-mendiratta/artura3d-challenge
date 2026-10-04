import { sequelize } from '../../src/db';
import { Order } from '../../src/models/order';

export async function resetDatabase(): Promise<void> {
  await sequelize.query('TRUNCATE manufacturing_packets, quotes, orders');
}

export function insertOrder(values: Partial<{ thicknessMm: number }> = {}): Promise<Order> {
  return Order.create({
    patientRef: 'PT-1042',
    lengthMm: 260,
    widthMm: 90.5,
    thicknessMm: 3.5,
    colour: '#3366FF',
    ...values,
  });
}
