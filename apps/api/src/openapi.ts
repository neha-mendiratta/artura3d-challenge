import { notesInputSchema, orderInputSchema } from '@artura/shared';
import { z } from 'zod';

// The API description shown at /docs (Swagger UI) and /openapi.json.
// Request bodies are generated from the shared Zod schemas, so the documented rules are the enforced rules.
// Response shapes are written here; a test checks they list the same fields as the models.

function requestSchema(schema: z.ZodType) {
  const jsonSchema = z.toJSONSchema(schema, { io: 'input' });
  delete jsonSchema.$schema;
  return jsonSchema;
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (description: string, schema: object) => ({ description, content: { 'application/json': { schema } } });
const errorResponse = (name: string) => ({ $ref: `#/components/responses/${name}` });
const badRequest = errorResponse('BadRequest');
const notFound = errorResponse('NotFound');
const conflict = errorResponse('Conflict');
const internalError = errorResponse('InternalError');

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Order id (UUID)',
  schema: { type: 'string', format: 'uuid' },
};
const uuid = { type: 'string', format: 'uuid' };
const dateTime = { type: 'string', format: 'date-time' };
const errorBody = (code: string) => json(code, ref('Error'));

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Artura3D Orders API',
    version: '1.0.0',
    description:
      'Create custom orthotic orders, submit them, quote them and follow the manufacturing packet.\n\n' +
      'Workflow: an order is `Draft` (editable) until submitted; a `Submitted` order is locked except its notes. ' +
      'Quoting a `Submitted` order creates the quote and a `Pending` manufacturing packet, which a background worker ' +
      'completes within seconds.\n\nEvery error has the same shape: `{ "error": { "code", "message" } }`.',
  },
  servers: [{ url: '/' }],
  paths: {
    '/orders': {
      get: {
        summary: 'List orders, newest first',
        tags: ['Orders'],
        description: 'Pages of 20. Pass `nextCursor` from a page as `cursor` to get the next one.',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Draft', 'Submitted'] } },
          { name: 'cursor', in: 'query', description: '`nextCursor` from the previous page', schema: uuid },
        ],
        responses: { 200: json('A page of orders', ref('OrdersPage')), 400: badRequest, 500: internalError },
      },
      post: {
        summary: 'Create an order (Draft)',
        tags: ['Orders'],
        requestBody: { required: true, ...json('The order', ref('OrderInput')) },
        responses: { 201: json('The created order', ref('Order')), 400: badRequest, 500: internalError },
      },
    },
    '/orders/{id}': {
      parameters: [idParameter],
      get: {
        summary: 'Get an order with its quote',
        tags: ['Orders'],
        responses: { 200: json('The order', ref('Order')), 400: badRequest, 404: notFound, 500: internalError },
      },
      put: {
        summary: 'Edit a Draft order',
        tags: ['Orders'],
        description: 'Replaces every field. 409 if the order is not a Draft.',
        requestBody: { required: true, ...json('The order', ref('OrderInput')) },
        responses: {
          200: json('The updated order', ref('Order')),
          400: badRequest,
          404: notFound,
          409: conflict,
          500: internalError,
        },
      },
    },
    '/orders/{id}/notes': {
      parameters: [idParameter],
      patch: {
        summary: 'Edit the notes (any status)',
        tags: ['Orders'],
        description: 'The only change allowed after submit.',
        requestBody: { required: true, ...json('The notes', ref('NotesInput')) },
        responses: { 200: json('The updated order', ref('Order')), 400: badRequest, 404: notFound, 500: internalError },
      },
    },
    '/orders/{id}/submit': {
      parameters: [idParameter],
      post: {
        summary: 'Submit a Draft order',
        tags: ['Orders'],
        description: 'Draft → Submitted. 409 if it is already submitted.',
        responses: {
          200: json('The submitted order', ref('Order')),
          400: badRequest,
          404: notFound,
          409: conflict,
          500: internalError,
        },
      },
    },
    '/orders/{id}/quote': {
      parameters: [idParameter],
      post: {
        summary: 'Quote a Submitted order (idempotent)',
        tags: ['Quote and packet'],
        description:
          'The first call creates the quote and a Pending manufacturing packet (201). Later calls return the same ' +
          'quote (200). Price: $100 + $2 per mm of thickness + $0.50 per mm of width, +15% if expedited. ' +
          '409 if the order is a Draft.',
        responses: {
          201: json('The new quote', ref('Quote')),
          200: json('The existing quote', ref('Quote')),
          400: badRequest, 404: notFound, 409: conflict, 500: internalError,
        },
      },
    },
    '/orders/{id}/packet': {
      parameters: [idParameter],
      get: {
        summary: 'Get the manufacturing packet',
        tags: ['Quote and packet'],
        description: '404 until the order is quoted.',
        responses: {
          200: json('The packet', ref('ManufacturingPacket')),
          400: badRequest,
          404: notFound,
          500: internalError,
        },
      },
    },
  },
  components: {
    schemas: {
      OrderInput: requestSchema(orderInputSchema),
      NotesInput: requestSchema(notesInputSchema),
      Order: {
        type: 'object',
        properties: {
          id: uuid,
          patientRef: { type: 'string' },
          lengthMm: { type: 'number' },
          widthMm: { type: 'number' },
          thicknessMm: { type: 'number' },
          colour: { type: 'string', examples: ['#3366FF'] },
          expedite: { type: 'boolean' },
          notes: { type: ['string', 'null'] },
          status: { type: 'string', enum: ['Draft', 'Submitted'] },
          createdAt: dateTime,
          updatedAt: dateTime,
          submittedAt: { type: ['string', 'null'], format: 'date-time' },
          quote: { anyOf: [ref('Quote'), { type: 'null' }], description: 'null until quoted' },
        },
      },
      Quote: {
        type: 'object',
        properties: {
          id: uuid,
          orderId: uuid,
          totalCents: { type: 'integer', description: 'Total in cents, e.g. 17509 = $175.09' },
          createdAt: dateTime,
        },
      },
      ManufacturingPacket: {
        type: 'object',
        properties: {
          id: uuid,
          orderId: uuid,
          status: { type: 'string', enum: ['Pending', 'Completed', 'Failed'] },
          payload: {
            type: ['object', 'null'],
            description: 'The order as submitted plus its quote; set when Completed',
          },
          error: { type: ['string', 'null'], description: 'A plain message, set when Failed' },
          createdAt: dateTime,
          updatedAt: dateTime,
        },
      },
      OrdersPage: {
        type: 'object',
        properties: {
          items: { type: 'array', items: ref('Order') },
          nextCursor: { type: ['string', 'null'], format: 'uuid', description: 'null on the last page' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', enum: ['VALIDATION_ERROR', 'NOT_FOUND', 'CONFLICT', 'INTERNAL_ERROR'] },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: errorBody('VALIDATION_ERROR: invalid id, query or body; the message names the field'),
      NotFound: errorBody('NOT_FOUND: no such order (or no packet yet)'),
      Conflict: errorBody('CONFLICT: not allowed in the order status (e.g. editing a Submitted order)'),
      InternalError: errorBody('INTERNAL_ERROR: unexpected error; details are logged, never returned'),
    },
  },
};
