import { orderInputSchema } from '@artura/shared';
import { Button, Checkbox, ColorInput, Group, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { OrderFormProps } from '../types';

// 0.1 mm steps, and out-of-range values are shown as errors rather than silently corrected.
const dimensionProps = { step: 0.1, decimalScale: 1, clampBehavior: 'none' } as const;

// Validated with the same schema as the API, so the form and the API cannot disagree.
export function OrderForm({ initialValues, locked, saving, onSave }: OrderFormProps) {
  const form = useForm({
    initialValues: { ...initialValues, notes: initialValues.notes ?? '' },
    validate: schemaResolver(orderInputSchema, { sync: true }),
  });

  return (
    <form onSubmit={form.onSubmit(onSave)}>
      <Stack>
        <TextInput label="Patient ref" disabled={locked} {...form.getInputProps('patientRef')} />
        <Group grow align="flex-start">
          <NumberInput label="Length (mm)" min={150} max={350} {...dimensionProps} disabled={locked} {...form.getInputProps('lengthMm')} />
          <NumberInput label="Width (mm)" min={50} max={150} {...dimensionProps} disabled={locked} {...form.getInputProps('widthMm')} />
          <NumberInput label="Thickness (mm)" min={1} max={15} {...dimensionProps} disabled={locked} {...form.getInputProps('thicknessMm')} />
        </Group>
        <ColorInput label="Colour" disabled={locked} {...form.getInputProps('colour')} />
        <Checkbox label="Expedite (+15%)" disabled={locked} {...form.getInputProps('expedite', { type: 'checkbox' })} />
        <Textarea label="Notes" autosize minRows={2} {...form.getInputProps('notes')} />
        <Button type="submit" loading={saving} className="fit-content">
          {locked ? 'Save notes' : 'Save'}
        </Button>
      </Stack>
    </form>
  );
}
