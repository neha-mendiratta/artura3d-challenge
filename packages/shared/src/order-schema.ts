import { z } from 'zod';

const hasAtMostOneDecimal = (value: number) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;

// Messages are written for the person filling in the form; the API returns the same ones.
const dimension = (label: string, min: number, max: number) => {
  const range = `${label} must be between ${min} and ${max} mm`;
  return z
    .number({ error: `${label} must be a number` })
    .min(min, range)
    .max(max, range)
    .refine(hasAtMostOneDecimal, `${label} can have at most 1 decimal place`);
};

// Empty or whitespace-only notes are stored as null.
const notes = z
  .string()
  .trim()
  .max(1000, 'Notes must be 1000 characters or fewer')
  .transform((value) => value || null)
  .nullable()
  .default(null);

export const orderInputSchema = z.strictObject({
  patientRef: z
    .string({ error: 'Patient ref is required' })
    .trim()
    .min(1, 'Patient ref is required')
    .max(50, 'Patient ref must be 50 characters or fewer'),
  lengthMm: dimension('Length', 150, 350),
  widthMm: dimension('Width', 50, 150),
  thicknessMm: dimension('Thickness', 1, 15),
  colour: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Colour must be a hex colour like #3366FF')
    .transform((value) => value.toUpperCase()),
  expedite: z.boolean().default(false),
  notes,
});

export const notesInputSchema = z.strictObject({ notes });

export type OrderInput = z.infer<typeof orderInputSchema>;
export type NotesInput = z.infer<typeof notesInputSchema>;
