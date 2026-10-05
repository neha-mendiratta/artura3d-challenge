// Allowed orthotic dimensions in mm, in one place: used by the validation schema,
// the form inputs and the 3D preview.
export const DIMENSION_LIMITS = {
  lengthMm: { label: 'Length', min: 150, max: 350 },
  widthMm: { label: 'Width', min: 50, max: 150 },
  thicknessMm: { label: 'Thickness', min: 1, max: 15 },
} as const;
