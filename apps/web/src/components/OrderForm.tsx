import { DIMENSION_LIMITS, orderInputSchema } from '@artura/shared';
import { Button, Checkbox, ColorInput, Grid, Group, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { OrderFormProps } from '../types';
import { OrthoticPreview } from './OrthoticPreview';

// 0.1 mm steps, and out-of-range values are shown as errors rather than silently corrected.
const dimensionProps = {
  step: 0.1,
  decimalScale: 1,
  clampBehavior: 'none',
} as const;

// Validated with the same schema as the API, so the form and the API cannot disagree.
// The 3D preview reads the form's current values, so it updates as the user types.
export function OrderForm({ initialValues, locked, saving, onSave }: OrderFormProps) {
  const form = useForm({
    initialValues: {
      ...initialValues,
      notes: initialValues.notes ?? '',
    },
    validate: schemaResolver(orderInputSchema, { sync: true }),
  });

  return (
    <form onSubmit={form.onSubmit(onSave)}>
      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack>
            <TextInput
              label="Patient ref"
              disabled={locked}
              {...form.getInputProps('patientRef')}
            />

            <Group grow align="flex-start">
              <NumberInput
                label="Length (mm)"
                min={DIMENSION_LIMITS.lengthMm.min}
                max={DIMENSION_LIMITS.lengthMm.max}
                disabled={locked}
                {...dimensionProps}
                {...form.getInputProps('lengthMm')}
              />

              <NumberInput
                label="Width (mm)"
                min={DIMENSION_LIMITS.widthMm.min}
                max={DIMENSION_LIMITS.widthMm.max}
                disabled={locked}
                {...dimensionProps}
                {...form.getInputProps('widthMm')}
              />

              <NumberInput
                label="Thickness (mm)"
                min={DIMENSION_LIMITS.thicknessMm.min}
                max={DIMENSION_LIMITS.thicknessMm.max}
                disabled={locked}
                {...dimensionProps}
                {...form.getInputProps('thicknessMm')}
              />
            </Group>

            <ColorInput
              label="Colour"
              disabled={locked}
              {...form.getInputProps('colour')}
            />

            <Checkbox
              label="Expedite (+15%)"
              disabled={locked}
              {...form.getInputProps('expedite', { type: 'checkbox' })}
            />

            <Textarea
              label="Notes"
              autosize
              minRows={2}
              {...form.getInputProps('notes')}
            />

            <Button
              type="submit"
              loading={saving}
              className="fit-content"
            >
              {locked ? 'Save notes' : 'Save'}
            </Button>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <OrthoticPreview
            lengthMm={form.values.lengthMm}
            widthMm={form.values.widthMm}
            thicknessMm={form.values.thicknessMm}
            colour={form.values.colour}
          />
        </Grid.Col>
      </Grid>
    </form>
  );
}
