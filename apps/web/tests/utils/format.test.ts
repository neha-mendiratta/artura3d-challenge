import { formatCents } from '../../src/utils/format';

describe('formatCents', () => {
  test.each([
    [17509, '175.09'],
    [14600, '146.00'],
    [5, '0.05'],
  ])('formats %p as %p', (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });
});
