import { Router } from 'express';
import { validateId } from '../middleware/validate';
import { getPacket } from '../services/packet-service';
import { OrderRequest } from '../types';

export const packetRoutes = Router();

packetRoutes.get('/:id/packet', validateId, async (req: OrderRequest, res) => {
  res.json(await getPacket(req.params.id));
});
