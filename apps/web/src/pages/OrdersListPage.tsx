import { Alert, Anchor, Button, Group, Loader, SegmentedControl, Stack, Table, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { Link } from 'react-router';
import { StatusBadge } from '../components/StatusBadge';
import { useOrders } from '../hooks/orders';
import { OrderFilter } from '../types';
import { formatCents, formatDate } from '../utils/format';

const filters: OrderFilter[] = ['All', 'Draft', 'Submitted'];

export function OrdersListPage() {
  const [filter, setFilter] = useState<OrderFilter>('All');
  const status = filter === 'All' ? undefined : filter;
  const { data, error, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useOrders(status);
  const orders = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Orders</Title>
        <Button component={Link} to="/orders/new">
          New order
        </Button>
      </Group>

      <SegmentedControl data={filters} value={filter} onChange={setFilter} className="fit-content" />

      {isPending && <Loader />}
      {error && <Alert color="red">{error.message}</Alert>}
      {data && orders.length === 0 && <Text className="muted">No orders yet.</Text>}

      {orders.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Patient ref</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>L × W × T (mm)</Table.Th>
              <Table.Th>Quote</Table.Th>
              <Table.Th>Created</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order) => (
              <Table.Tr key={order.id}>
                <Table.Td>
                  <Anchor component={Link} to={`/orders/${order.id}`}>
                    {order.patientRef}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={order.status} />
                </Table.Td>
                <Table.Td>
                  {order.lengthMm} × {order.widthMm} × {order.thicknessMm}
                </Table.Td>
                <Table.Td>{order.quote ? formatCents(order.quote.totalCents) : '—'}</Table.Td>
                <Table.Td>{formatDate(order.createdAt)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {hasNextPage && (
        <Button variant="default" onClick={() => fetchNextPage()} loading={isFetchingNextPage} className="fit-content">
          Load more
        </Button>
      )}
    </Stack>
  );
}
