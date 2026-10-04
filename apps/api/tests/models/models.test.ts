import { ForeignKeyConstraintError, QueryTypes, UniqueConstraintError } from 'sequelize';
import { sequelize } from '../../src/db';
import { ManufacturingPacket } from '../../src/models/manufacturing-packet';
import { Order } from '../../src/models/order';
import { Quote } from '../../src/models/quote';
import { insertOrder, resetDatabase } from '../helpers/db';
import { runMigrations } from '../helpers/migrate';

const missingOrderId = '01a104ee-0000-7000-8000-000000000000';

const insertQuote = (orderId: string) => Quote.create({ orderId, totalCents: 17509 });

beforeEach(resetDatabase);

describe('data model', () => {
  test('creates an order with default status Draft and expedite false', async () => {
    const order = await insertOrder();
    expect(order.status).toBe('Draft');
    expect(order.expedite).toBe(false);
  });

  test('rejects a second quote for the same order', async () => {
    const order = await insertOrder();
    await insertQuote(order.id);
    await expect(insertQuote(order.id)).rejects.toBeInstanceOf(UniqueConstraintError);
  });

  test('rejects a second packet for the same order', async () => {
    const order = await insertOrder();
    await ManufacturingPacket.create({ orderId: order.id });
    await expect(ManufacturingPacket.create({ orderId: order.id })).rejects.toBeInstanceOf(
      UniqueConstraintError,
    );
  });

  test('rejects a quote for a non-existent order', async () => {
    await expect(insertQuote(missingOrderId)).rejects.toBeInstanceOf(ForeignKeyConstraintError);
  });

  test('creates a packet with status Pending', async () => {
    const order = await insertOrder();
    const packet = await ManufacturingPacket.create({ orderId: order.id });
    expect(packet).toMatchObject({ status: 'Pending', payload: null, error: null });
  });

  test('stores and returns 1-decimal dimensions as numbers', async () => {
    const order = await insertOrder({ thicknessMm: 3.5 });
    const saved = await Order.findByPk(order.id);
    expect(saved?.thicknessMm).toBe(3.5);
  });

  test('rounds dimensions to 1 decimal place at the database', async () => {
    const order = await insertOrder({ thicknessMm: 3.55 });
    const saved = await Order.findByPk(order.id);
    expect(saved?.thicknessMm).toBe(3.6);
  });

  test('updates updatedAt but not createdAt on update', async () => {
    const order = await insertOrder();
    const { createdAt, updatedAt } = order;
    await order.update({ notes: 'Left foot only' });
    expect(order.createdAt).toEqual(createdAt);
    expect(order.updatedAt.getTime()).toBeGreaterThan(updatedAt.getTime());
  });

  test('generates time-ordered ids', async () => {
    const first = await insertOrder();
    const second = await insertOrder();
    expect(second.id > first.id).toBe(true);
  });

  test('creates exactly the expected indexes', async () => {
    const rows = await sequelize.query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes
       WHERE tablename IN ('orders', 'quotes', 'manufacturing_packets')
       ORDER BY indexname`,
      { type: QueryTypes.SELECT },
    );
    expect(rows.map((row) => row.indexname)).toEqual([
      'manufacturing_packets_order_id_key',
      'manufacturing_packets_pkey',
      'manufacturing_packets_status_id_idx',
      'orders_pkey',
      'orders_status_id_idx',
      'quotes_order_id_key',
      'quotes_pkey',
    ]);
  });

  test('does not re-apply migrations', () => {
    expect(runMigrations()).toContain('No migrations were executed');
  });
});
