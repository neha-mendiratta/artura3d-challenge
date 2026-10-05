import { DIMENSION_LIMITS } from '@artura/shared';
import { clampDimension, previewColour } from '../../src/utils/preview';

describe('clampDimension', () => {
  test.each([
    [90, 90],
    [200, 150],
    [10, 50],
    ['' as unknown as number, 50],
  ])('keeps width %p inside the allowed range as %p', (value, expected) => {
    expect(clampDimension(value, DIMENSION_LIMITS.widthMm)).toBe(expected);
  });
});

describe('previewColour', () => {
  test('keeps a valid colour and replaces a half-typed one', () => {
    expect(previewColour('#AA3366')).toBe('#AA3366');
    expect(previewColour('#AA')).toBe('#3366FF');
  });
});
