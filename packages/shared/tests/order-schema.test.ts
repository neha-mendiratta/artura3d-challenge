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

  test('trims the patient ref', () => {
    expect(orderInputSchema.parse({ ...validOrder, patientRef: '  PT-1042  ' }).patientRef).toBe('PT-1042');
  });

  test('accepts limits: 50-character patient ref, 1000-character notes', () => {
    const result = orderInputSchema.safeParse({ ...validOrder, patientRef: 'P'.repeat(50), notes: 'n'.repeat(1000) });
    expect(result.success).toBe(true);
  });

  test.each([
    [{ patientRef: '  ' }, 'Patient ref is required'],
    [{ patientRef: 'P'.repeat(51) }, 'Patient ref must be 50 characters or fewer'],
    [{ notes: 'n'.repeat(1001) }, 'Notes must be 1000 characters or fewer'],
    [{ widthMm: 200 }, 'Width must be between 50 and 150 mm'],
    [{ thicknessMm: 3.55 }, 'Thickness can have at most 1 decimal place'],
    [{ colour: 'blue' }, 'Colour must be a hex colour like #3366FF'],
  ])('explains the problem in plain words for %p', (change, message) => {
    const result = orderInputSchema.safeParse({ ...validOrder, ...change });
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});
