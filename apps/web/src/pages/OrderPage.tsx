import { Alert, Group, Loader, Stack, Title } from '@mantine/core';
import { useParams } from 'react-router';
import { OrderForm } from '../components/OrderForm';
import { StatusBadge } from '../components/StatusBadge';
import { useOrder, useUpdateNotes, useUpdateOrder } from '../hooks/orders';
import { toOrderInput } from '../utils/order';

export function OrderPage() {
  const id = useParams().id!; // the route is /orders/:id, so id is always present
  const { data: order, error, isPending } = useOrder(id);
  const updateOrder = useUpdateOrder(id);
  const updateNotes = useUpdateNotes(id);

  if (isPending) return <Loader />;
  if (error) return <Alert color="red">{error.message}</Alert>;

  const locked = order.status === 'Submitted';

  return (
    <Stack>
      <Group>
        <Title order={2}>{order.patientRef}</Title>
        <StatusBadge status={order.status} />
      </Group>
      <OrderForm
        // A new key resets the form to the saved order after each save.
        key={order.updatedAt}
        initialValues={toOrderInput(order)}
        locked={locked}
        saving={updateOrder.isPending || updateNotes.isPending}
        onSave={(values) => (locked ? updateNotes.mutate(values.notes) : updateOrder.mutate(values))}
      />
    </Stack>
  );
}
