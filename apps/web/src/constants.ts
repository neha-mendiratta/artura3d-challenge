import { OrderInput } from '@artura/shared';

// Starting values for a new order: a typical adult insole, so the 3D preview has a shape straight away.
export const NEW_ORDER_DEFAULTS: OrderInput = {
  patientRef: '',
  lengthMm: 260,
  widthMm: 90,
  thicknessMm: 3,
  colour: '#3366FF',
  expedite: false,
  notes: null,
};
