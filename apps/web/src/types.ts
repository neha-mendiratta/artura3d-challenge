import { OrderInput, OrderStatus, PacketStatus } from '@artura/shared';
import { RefObject } from 'react';

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

// What the 3D preview shows: the form's current values, which may be mid-edit (empty or out of range).
export type OrthoticPreviewProps = {
  lengthMm: number;
  widthMm: number;
  thicknessMm: number;
  colour: string;
};

export type OrthoticModelProps = OrthoticPreviewProps & {
  // A fixed element for the measurement labels (see OrthoticPreview).
  labelContainer: RefObject<HTMLElement>;
};
