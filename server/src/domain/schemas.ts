import { z } from 'zod';

/** Request validation with Zod: invalid input never reaches the database. */
export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  customerName: z.string().trim().min(2, 'Name must have at least 2 characters').max(80),
  customerEmail: z.string().trim().email('Invalid email'),
  startAt: z.string().datetime({ offset: true, message: 'startAt must be an ISO date-time' }),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const listBookingsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['confirmed', 'cancelled']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
export type ListBookingsQuery = z.infer<typeof listBookingsQuery>;

export const slotsQuery = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
});
