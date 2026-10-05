import { OrderStatus, PacketStatus } from '@artura/shared';

export type Quote = {
  id: string;
  orderId: string;
  totalCents: number;
  createdAt: string;
};

export type Order = {
  id: string;
  patientRef: string;
  lengthMm: number;
  widthMm: number;
  thicknessMm: number;
  colour: string;
  expedite: boolean;
  notes: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  quote: Quote | null;
};

export type OrderList = {
  items: Order[];
  nextCursor: string | null;
};

export type Packet = {
  id: string;
  orderId: string;
  status: PacketStatus;
  payload: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RequestOptions = {
  method?: string;
  body?: unknown;
};
