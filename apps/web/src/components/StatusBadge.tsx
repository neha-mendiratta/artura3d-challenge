import { OrderStatus, PacketStatus } from '@artura/shared';
import { Badge } from '@mantine/core';
import { StatusBadgeProps } from '../types';

const colours: Record<OrderStatus | PacketStatus, string> = {
  Draft: 'gray',
  Submitted: 'blue',
  Pending: 'yellow',
  Completed: 'green',
  Failed: 'red',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge color={colours[status]}>{status}</Badge>;
}
