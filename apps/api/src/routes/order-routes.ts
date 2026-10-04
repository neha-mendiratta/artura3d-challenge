import { NotesInput, notesInputSchema, OrderInput, orderInputSchema } from '@artura/shared';
import { Router } from 'express';
import { OrderRequest } from '../types';
import { validateBody, validateId } from '../middleware/validate';
import { createOrder, getOrder, submitOrder, updateNotes, updateOrder } from '../services/order-service';

export const orderRoutes = Router();

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
