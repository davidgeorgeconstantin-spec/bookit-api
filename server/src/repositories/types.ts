import type { CreateBookingInput, ListBookingsQuery } from '../domain/schemas.js';
import type { Booking, Page, Service } from '../domain/types.js';

/**
 * The routes only talk to this interface. We can swap the in-memory store
 * (tests, quick start) for PostgreSQL without changing any route.
 */
export interface BookingRepository {
  listServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | null>;
  listBookings(query: ListBookingsQuery): Promise<Page<Booking>>;
  bookingsOnDay(date: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | null>;
  createBooking(input: CreateBookingInput & { endAt: string }): Promise<Booking>;
  cancelBooking(id: string): Promise<Booking | null>;
}
