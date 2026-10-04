import { z } from 'zod';

const hasAtMostOneDecimal = (value: number) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;

const dimension = (min: number, max: number) =>
  z.number().min(min).max(max).refine(hasAtMostOneDecimal, 'must have at most 1 decimal place');

// Empty or whitespace-only notes are stored as null.
const notes = z
  .string()
  .trim()
  .max(1000)
  .transform((value) => value || null)
  .nullable()
  .default(null);

export const orderInputSchema = z.strictObject({
  patientRef: z.string().trim().min(1).max(50),
  lengthMm: dimension(150, 350),
  widthMm: dimension(50, 150),
  thicknessMm: dimension(1, 15),
  colour: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'must be a hex colour like #3366FF')
    .transform((value) => value.toUpperCase()),
  expedite: z.boolean().default(false),
  notes,
});

export const notesInputSchema = z.strictObject({ notes });

export type OrderInput = z.infer<typeof orderInputSchema>;
export type NotesInput = z.infer<typeof notesInputSchema>;
