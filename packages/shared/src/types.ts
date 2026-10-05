export type OrderStatus = 'Draft' | 'Submitted';

export type PacketStatus = 'Pending' | 'Completed' | 'Failed';

export type OrderListFilter = {
  status?: OrderStatus;
  cursor?: string;
};
