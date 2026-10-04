import { orderInputSchema } from '../src/order-schema';

const validOrder = {
  patientRef: 'PT-1042',
  lengthMm: 260,
  widthMm: 90.5,
  thicknessMm: 3.5,
  colour: '#3366FF',
};

describe('orderInputSchema', () => {
  test.each([1, 1.0, 1.1, 15, 15.0])('accepts thickness %p', (thicknessMm) => {
    expect(orderInputSchema.safeParse({ ...validOrder, thicknessMm }).success).toBe(true);
  });

  test.each([1.01, 1.11, 15.01])('rejects thickness %p', (thicknessMm) => {
    expect(orderInputSchema.safeParse({ ...validOrder, thicknessMm }).success).toBe(false);
  });

  test.each([
    [undefined, null],
    [null, null],
    ['', null],
    ['   ', null],
    [' hello ', 'hello'],
  ])('normalises notes %p to %p', (notes, expected) => {
    expect(orderInputSchema.parse({ ...validOrder, notes }).notes).toBe(expected);
  });
});
