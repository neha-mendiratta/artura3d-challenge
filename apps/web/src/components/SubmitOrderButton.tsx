import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSubmitOrder } from '../hooks/orders';
import { OrderIdProps } from '../types';

// Submitting cannot be undone, so it asks for confirmation first.
export function SubmitOrderButton({ orderId }: OrderIdProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const submitOrder = useSubmitOrder(orderId);

  const handleSubmit = () => {
    submitOrder.mutate(undefined, { onSettled: close });
  };

  return (
    <>
      <Button onClick={open}>Submit order</Button>
      <Modal opened={opened} onClose={close} title="Submit this order?">
        <Stack>
          <Text>After submitting, only the notes can be changed.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button loading={submitOrder.isPending} onClick={handleSubmit}>
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
