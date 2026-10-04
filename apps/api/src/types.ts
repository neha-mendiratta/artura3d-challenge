import { Request } from 'express';

export type OrderStatus = 'Draft' | 'Submitted';

export type PacketStatus = 'Pending' | 'Completed' | 'Failed';

export type PriceInput = {
  thicknessMm: number;
  widthMm: number;
  expedite: boolean;
};

// For routes with an :id param, after validateId has checked it is a single valid UUID.
export type OrderRequest = Request<{ id: string }>;
