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

// How often the order page checks a Pending manufacturing packet.
export const PACKET_POLL_INTERVAL_MS = 2000;
