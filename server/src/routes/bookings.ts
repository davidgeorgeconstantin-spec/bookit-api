import { Router } from 'express';
import { HttpError } from '../domain/errors.js';
import { createBookingSchema, listBookingsQuery } from '../domain/schemas.js';
import { CLOSING_HOUR, OPENING_HOUR, overlaps } from '../domain/slots.js';
import type { BookingRepository } from '../repositories/types.js';

export function bookingsRouter(repo: BookingRepository) {
  const router = Router();

  // GET /api/bookings?page=1&pageSize=10&status=confirmed&date=2026-12-01
  router.get('/', async (req, res) => {
    res.json(await repo.listBookings(listBookingsQuery.parse(req.query)));
  });

  // GET /api/bookings/:id
  router.get('/:id', async (req, res) => {
    const booking = await repo.getBooking(req.params.id);
    if (!booking) throw new HttpError(404, 'Booking not found');
    res.json({ data: booking });
  });

  // POST /api/bookings
  router.post('/', async (req, res) => {
    const input = createBookingSchema.parse(req.body);
    const service = await repo.getService(input.serviceId);
    if (!service) throw new HttpError(404, 'Service not found');

    const start = new Date(input.startAt);
    const end = new Date(start.getTime() + service.duration * 60_000);
    if (start.getTime() <= Date.now()) throw new HttpError(422, 'Booking must be in the future');
    const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMin = startMin + service.duration;
    if (startMin < OPENING_HOUR * 60 || endMin > CLOSING_HOUR * 60) {
      throw new HttpError(422, `We are open ${OPENING_HOUR}:00–${CLOSING_HOUR}:00 (UTC)`);
    }

    const sameDay = await repo.bookingsOnDay(input.startAt.slice(0, 10));
    const conflict = sameDay.some((b) => b.status === 'confirmed' && overlaps(start, end, new Date(b.startAt), new Date(b.endAt)));
    if (conflict) throw new HttpError(409, 'This time slot is already booked');

    const booking = await repo.createBooking({ ...input, startAt: start.toISOString(), endAt: end.toISOString() });
    res.status(201).location(`/api/bookings/${booking.id}`).json({ data: booking });
  });

  // PATCH /api/bookings/:id/cancel
  router.patch('/:id/cancel', async (req, res) => {
    const booking = await repo.cancelBooking(req.params.id);
    if (!booking) throw new HttpError(404, 'Booking not found');
    res.json({ data: booking });
  });

  return router;
}
