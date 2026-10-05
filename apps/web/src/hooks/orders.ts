import { OrderInput, OrderStatus } from '@artura/shared';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client';
import { createOrder, getOrder, listOrders, updateNotes, updateOrder } from '../api/orders';
import { Order } from '../types';

// Pages through the orders list: each page starts at the previous page's nextCursor.
export function useOrders(status?: OrderStatus) {
  return useInfiniteQuery({
    queryKey: ['orders', status],
    queryFn: ({ pageParam }) => listOrders({ status, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: ['order', id], queryFn: () => getOrder(id) });
}

// After any change to an order: show the saved order straight away and refresh the list.
// After a 409 (e.g. submitted in another tab), reload the order so the page shows its real state.
function useOrderMutation<Variables>(id: string | undefined, save: (variables: Variables) => Promise<Order>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: save,
    onSuccess: (order) => {
      queryClient.setQueryData(['order', order.id], order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      if (id && error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ['order', id] });
      }
    },
  });
}

export const useCreateOrder = () => useOrderMutation(undefined, (input: OrderInput) => createOrder(input));

export const useUpdateOrder = (id: string) => useOrderMutation(id, (input: OrderInput) => updateOrder(id, input));

export const useUpdateNotes = (id: string) => useOrderMutation(id, (notes: string | null) => updateNotes(id, notes));
