import { DimensionLimit } from '@artura/shared';
import { NEW_ORDER_DEFAULTS } from '../constants';

const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/;

// While the user types, a field can be empty or out of range; the model keeps a valid size.
export function clampDimension(value: number, { min, max }: DimensionLimit): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

// A half-typed colour (e.g. "#33") keeps the model in a valid colour.
export const previewColour = (value: string) => (HEX_COLOUR.test(value) ? value : NEW_ORDER_DEFAULTS.colour);
