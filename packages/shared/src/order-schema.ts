import { z } from 'zod';
import { DIMENSION_LIMITS } from './dimension-limits';
import { DimensionLimit } from './types';

const hasAtMostOneDecimal = (value: number) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;

// Messages are written for the person filling in the form; the API returns the same ones.
// Descriptions (meta) appear in the API docs, which are generated from this schema.
const dimension = ({ label, min, max }: DimensionLimit) => {
  const range = `${label} must be between ${min} and ${max} mm`;
  return z
    .number({ error: `${label} must be a number` })
    .min(min, range)
    .max(max, range)
    .refine(hasAtMostOneDecimal, `${label} can have at most 1 decimal place`)
    .meta({ description: `${label} in mm, at most 1 decimal place` });
};

// Empty or whitespace-only notes are stored as null.
const notes = z
  .string()
  .trim()
  .max(1000, 'Notes must be 1000 characters or fewer')
  .transform((value) => value || null)
  .nullable()
  .default(null)
  .meta({ description: 'Free text; empty or whitespace-only is saved as null' });

export const orderInputSchema = z.strictObject({
  patientRef: z
    .string({ error: 'Patient ref is required' })
    .trim()
    .min(1, 'Patient ref is required')
    .max(50, 'Patient ref must be 50 characters or fewer')
    .meta({ description: "The clinic's patient code, not the patient's name. Trimmed" }),
  lengthMm: dimension(DIMENSION_LIMITS.lengthMm),
  widthMm: dimension(DIMENSION_LIMITS.widthMm),
  thicknessMm: dimension(DIMENSION_LIMITS.thicknessMm),
  colour: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Colour must be a hex colour like #3366FF')
    .transform((value) => value.toUpperCase())
    .meta({ description: 'Hex colour #RRGGBB, saved uppercase' }),
  expedite: z.boolean().default(false).meta({ description: 'Adds 15% to the quote' }),
  notes,
});

export const notesInputSchema = z.strictObject({ notes });

export type OrderInput = z.infer<typeof orderInputSchema>;
export type NotesInput = z.infer<typeof notesInputSchema>;
