import { OrderInput, OrderListFilter } from '@artura/shared';
import { Order, OrderList, Packet, Quote } from '../types';
import { apiRequest } from './client';

export function listOrders(filter: OrderListFilter = {}): Promise<OrderList> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.cursor) params.set('cursor', filter.cursor);
  const query = params.size > 0 ? `?${params}` : '';
  return apiRequest(`/orders${query}`);
}

export const getOrder = (id: string) => apiRequest<Order>(`/orders/${id}`);

export const createOrder = (input: OrderInput) => apiRequest<Order>('/orders', { method: 'POST', body: input });

export const updateOrder = (id: string, input: OrderInput) =>
  apiRequest<Order>(`/orders/${id}`, { method: 'PUT', body: input });

export const updateNotes = (id: string, notes: string | null) =>
  apiRequest<Order>(`/orders/${id}/notes`, { method: 'PATCH', body: { notes } });

export const submitOrder = (id: string) => apiRequest<Order>(`/orders/${id}/submit`, { method: 'POST' });

export const createQuote = (id: string) => apiRequest<Quote>(`/orders/${id}/quote`, { method: 'POST' });

export const getPacket = (id: string) => apiRequest<Packet>(`/orders/${id}/packet`);
