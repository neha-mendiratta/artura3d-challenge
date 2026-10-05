import { Order } from '../../src/types';

export function makeOrder(values: Partial<Order> = {}): Order {
  return {
    id: '01a104ee-0000-7000-8000-000000000001',
    patientRef: 'PT-1042',
    lengthMm: 260,
    widthMm: 90.5,
    thicknessMm: 3.5,
    colour: '#3366FF',
    expedite: false,
    notes: null,
    status: 'Draft',
    createdAt: '2026-10-04T09:15:02.481Z',
    updatedAt: '2026-10-04T09:15:02.481Z',
    submittedAt: null,
    quote: null,
    ...values,
  };
}
