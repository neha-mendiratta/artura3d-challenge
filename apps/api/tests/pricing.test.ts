import { calculatePriceCents } from '../src/pricing';

describe('calculatePriceCents', () => {
  test('prices an order without expedite', () => {
    expect(calculatePriceCents({ thicknessMm: 3, widthMm: 80, expedite: false })).toBe(14600);
  });

  test('applies the expedite multiplier', () => {
    expect(calculatePriceCents({ thicknessMm: 3, widthMm: 80, expedite: true })).toBe(16790);
  });

  test('rounds to the nearest cent', () => {
    expect(calculatePriceCents({ thicknessMm: 3.5, widthMm: 90.5, expedite: true })).toBe(17509);
  });

  test('rounds a half cent up', () => {
    expect(calculatePriceCents({ thicknessMm: 1, widthMm: 50.6, expedite: true })).toBe(14640);
  });
});
