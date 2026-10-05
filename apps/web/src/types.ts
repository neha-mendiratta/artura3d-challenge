import { OrderInput, OrderStatus, PacketStatus } from '@artura/shared';

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

// The orders list filter: every order, or one status.
export type OrderFilter = 'All' | OrderStatus;

export type OrderFormProps = {
  initialValues: OrderInput;
  // Submitted orders: every field is read-only except notes.
  locked: boolean;
  saving: boolean;
  onSave: (values: OrderInput) => void;
};

export type StatusBadgeProps = { status: OrderStatus | PacketStatus };

export type OrderProps = { order: Order };

export type OrderIdProps = { orderId: string };
