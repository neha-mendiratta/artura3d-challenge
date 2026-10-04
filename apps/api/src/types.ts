export type OrderStatus = 'Draft' | 'Submitted';

export type PacketStatus = 'Pending' | 'Completed' | 'Failed';

export type PriceInput = {
  thicknessMm: number;
  widthMm: number;
  expedite: boolean;
};
