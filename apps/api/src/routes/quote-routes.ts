import { Router } from 'express';
import { validateId } from '../middleware/validate';
import { createQuote } from '../services/quote-service';
import { OrderRequest } from '../types';

export const quoteRoutes = Router();

quoteRoutes.post('/:id/quote', validateId, async (req: OrderRequest, res) => {
  const { quote, created } = await createQuote(req.params.id);
  res.status(created ? 201 : 200).json(quote);
});
