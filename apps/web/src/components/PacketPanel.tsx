import { Alert, Group, Loader, Text } from '@mantine/core';
import { usePacket } from '../hooks/packet';
import { OrderIdProps } from '../types';
import { StatusBadge } from './StatusBadge';

export function PacketPanel({ orderId }: OrderIdProps) {
  const { data: packet, error } = usePacket(orderId);

  if (error) return <Alert color="red">{error.message}</Alert>;
  if (!packet) return <Loader size="sm" />;

  return (
    <>
      <Group>
        <Text>Manufacturing packet:</Text>
        <StatusBadge status={packet.status} />
      </Group>
      {packet.status === 'Failed' && <Alert color="red">{packet.error}</Alert>}
    </>
  );
}
