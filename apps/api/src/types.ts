import { Request } from 'express';
import type { Quote } from './models/quote';

export type PriceInput = {
  thicknessMm: number;
  widthMm: number;
  expedite: boolean;
};

// For routes with an :id param, after validateId has checked it is a single valid UUID.
export type OrderRequest = Request<{ id: string }>;

export type QuoteResult = {
  quote: Quote;
  created: boolean;
};
