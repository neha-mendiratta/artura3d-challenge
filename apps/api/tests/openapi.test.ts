import { DIMENSION_LIMITS } from '@artura/shared';
import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import request from 'supertest';
import { parse } from 'yaml';
import { app } from '../src/app';
import { ManufacturingPacket } from '../src/models/manufacturing-packet';
import { Order } from '../src/models/order';
import { Quote } from '../src/models/quote';
import { openApiDocument } from '../src/openapi';
import { orderRoutes } from '../src/routes/order-routes';
import { packetRoutes } from '../src/routes/packet-routes';
import { quoteRoutes } from '../src/routes/quote-routes';

// Express routes have `methods` at runtime, but its types leave it out.
type RouteWithMethods = { path: string; methods: Record<string, boolean> };

// "GET /orders/{id}" for every route the routers handle (all mounted at /orders).
function routesOf(...routers: Router[]): string[] {
  return routers.flatMap((router) =>
    router.stack.flatMap((layer) => {
      const route = layer.route as RouteWithMethods | undefined;
      if (!route) return [];
      const path = `/orders${route.path}`.replace(/\/$/, '').replace(/:(\w+)/g, '{$1}');
      return Object.keys(route.methods).map((method) => `${method.toUpperCase()} ${path}`);
    }),
  );
}

function documentedRoutes(): string[] {
  return Object.entries(openApiDocument.paths).flatMap(([path, operations]) =>
    Object.keys(operations)
      .filter((key) => key !== 'parameters')
      .map((method) => `${method.toUpperCase()} ${path}`),
  );
}

const documentedFields = (name: 'Order' | 'Quote' | 'ManufacturingPacket') =>
  Object.keys(openApiDocument.components.schemas[name].properties).sort();

describe('API docs', () => {
  test('documents every route, and only existing routes', () => {
    expect(documentedRoutes().sort()).toEqual(routesOf(orderRoutes, quoteRoutes, packetRoutes).sort());
  });

  test('documents the same response fields as the models', () => {
    expect(documentedFields('Order')).toEqual([...Object.keys(Order.getAttributes()), 'quote'].sort());
    expect(documentedFields('Quote')).toEqual(Object.keys(Quote.getAttributes()).sort());
    expect(documentedFields('ManufacturingPacket')).toEqual(Object.keys(ManufacturingPacket.getAttributes()).sort());
  });

  test('takes the request rules from the shared schema', () => {
    const { widthMm } = openApiDocument.components.schemas.OrderInput.properties as Record<string, { maximum?: number }>;
    expect(widthMm?.maximum).toBe(DIMENSION_LIMITS.widthMm.max);
  });

  test('keeps the spec file up to date (run `npm run spec` after changing the API)', () => {
    const specFile = parse(readFileSync(resolve(__dirname, '../spec/openapi.yaml'), 'utf8'));
    expect(specFile).toEqual(openApiDocument);
  });

  test('serves the OpenAPI document and Swagger UI', async () => {
    const document = await request(app).get('/openapi.json').expect(200);
    expect(document.body.openapi).toBe('3.1.0');

    const ui = await request(app).get('/docs/').expect(200);
    expect(ui.text).toContain('swagger-ui');
  });
});
