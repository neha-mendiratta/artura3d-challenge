import { Stack, Title } from '@mantine/core';
import { useNavigate } from 'react-router';
import { OrderForm } from '../components/OrderForm';
import { NEW_ORDER_DEFAULTS } from '../constants';
import { useCreateOrder } from '../hooks/orders';

export function NewOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  return (
    <Stack>
      <Title order={2}>New order</Title>
      <OrderForm
        initialValues={NEW_ORDER_DEFAULTS}
        locked={false}
        saving={createOrder.isPending}
        onSave={(values) => createOrder.mutate(values, { onSuccess: (order) => navigate(`/orders/${order.id}`) })}
      />
    </Stack>
  );
}
