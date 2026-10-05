import { useQuery } from '@tanstack/react-query';
import { getPacket } from '../api/orders';
import { PACKET_POLL_INTERVAL_MS } from '../constants';

// Checks again every few seconds while the packet is Pending; stops once Completed or Failed.
export function usePacket(orderId: string) {
  return useQuery({
    queryKey: ['packet', orderId],
    queryFn: () => getPacket(orderId),
    refetchInterval: (query) => (query.state.data?.status === 'Pending' ? PACKET_POLL_INTERVAL_MS : false),
  });
}
