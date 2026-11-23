import { Router } from 'express';
import { HttpError } from '../domain/errors.js';
import { slotsQuery } from '../domain/schemas.js';
import { buildSlots } from '../domain/slots.js';
import type { BookingRepository } from '../repositories/types.js';

export function servicesRouter(repo: BookingRepository) {
  const router = Router();

  // GET /api/services
  router.get('/services', async (_req, res) => {
    res.json({ data: await repo.listServices() });
  });

  // GET /api/slots?serviceId=haircut&date=2026-12-01
  router.get('/slots', async (req, res) => {
    const { serviceId, date } = slotsQuery.parse(req.query);
    const service = await repo.getService(serviceId);
    if (!service) throw new HttpError(404, 'Service not found');
    res.json({ data: buildSlots(date, service, await repo.bookingsOnDay(date)) });
  });

  return router;
}
