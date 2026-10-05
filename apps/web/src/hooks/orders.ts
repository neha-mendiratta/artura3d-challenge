import { OrderStatus } from '@artura/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { listOrders } from '../api/orders';

// Pages through the orders list: each page starts at the previous page's nextCursor.
export function useOrders(status?: OrderStatus) {
  return useInfiniteQuery({
    queryKey: ['orders', status],
    queryFn: ({ pageParam }) => listOrders({ status, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
