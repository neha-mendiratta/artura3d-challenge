import { NotesInput, notesInputSchema, OrderInput, orderInputSchema } from '@artura/shared';
import { Router } from 'express';
import { z } from 'zod';
import { parseWith, validateBody, validateId } from '../middleware/validate';
import {
  createOrder,
  getOrder,
  listOrders,
  submitOrder,
  updateNotes,
  updateOrder,
} from '../services/order-service';
import { OrderRequest } from '../types';

const listQuerySchema = z.object({
  status: z.enum(['Draft', 'Submitted']).optional(),
  cursor: z.uuid().optional(),
});

export const orderRoutes = Router();

orderRoutes.get('/', async (req, res) => {
  res.json(await listOrders(parseWith(listQuerySchema, req.query)));
});

orderRoutes.post('/', validateBody(orderInputSchema), async (req, res) => {
  res.status(201).json(await createOrder(req.body as OrderInput));
});

orderRoutes.get('/:id', validateId, async (req: OrderRequest, res) => {
  res.json(await getOrder(req.params.id));
});

orderRoutes.put('/:id', validateId, validateBody(orderInputSchema), async (req: OrderRequest, res) => {
  res.json(await updateOrder(req.params.id, req.body as OrderInput));
});

orderRoutes.patch('/:id/notes', validateId, validateBody(notesInputSchema), async (req: OrderRequest, res) => {
  res.json(await updateNotes(req.params.id, (req.body as NotesInput).notes));
});

orderRoutes.post('/:id/submit', validateId, async (req: OrderRequest, res) => {
  res.json(await submitOrder(req.params.id));
});
