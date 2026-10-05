import { OrderStatus, PacketStatus } from '@artura/shared';
import { Badge } from '@mantine/core';

const colours: Record<OrderStatus | PacketStatus, string> = {
  Draft: 'gray',
  Submitted: 'blue',
  Pending: 'yellow',
  Completed: 'green',
  Failed: 'red',
};

export function StatusBadge({ status }: { status: OrderStatus | PacketStatus }) {
  return <Badge color={colours[status]}>{status}</Badge>;
}
