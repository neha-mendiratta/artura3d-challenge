import {
  BASE_PRICE_CENTS,
  EXPEDITE_PERCENT,
  THICKNESS_RATE_CENTS_PER_MM,
  WIDTH_RATE_CENTS_PER_MM,
} from './constants';
import { PriceInput } from './types';

// Each part is rounded to whole cents before adding, so the total is exact.
export function calculatePriceCents({ thicknessMm, widthMm, expedite }: PriceInput): number {
  const subtotal =
    BASE_PRICE_CENTS +
    Math.round(thicknessMm * THICKNESS_RATE_CENTS_PER_MM) +
    Math.round(widthMm * WIDTH_RATE_CENTS_PER_MM);

  const total = expedite ? Math.round((subtotal * EXPEDITE_PERCENT) / 100) : subtotal;

  return total;
}
