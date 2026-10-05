import { Button, Text } from '@mantine/core';
import { useCreateQuote } from '../hooks/orders';
import { OrderProps } from '../types';
import { formatCents } from '../utils/format';

export function QuotePanel({ order }: OrderProps) {
  const createQuote = useCreateQuote(order.id);

  if (order.quote) {
    return <Text>Quote: {formatCents(order.quote.totalCents)}</Text>;
  }
  return (
    <Button onClick={() => createQuote.mutate()} loading={createQuote.isPending} className="fit-content">
      Generate quote
    </Button>
  );
}
