import { randomUUID } from 'node:crypto';
import type { BookingRepository } from './types.js';
import type { Booking, Service } from '../domain/types.js';

export const SEED_SERVICES: Service[] = [
  { id: 'haircut', name: 'Haircut', duration: 30, price: 60 },
  { id: 'beard', name: 'Beard trim', duration: 20, price: 35 },
  { id: 'massage', name: 'Relax massage', duration: 60, price: 150 },
  { id: 'consult', name: 'Style consultation', duration: 45, price: 90 },
];

export function createMemoryRepository(): BookingRepository {
  const services = [...SEED_SERVICES];
  const bookings: Booking[] = [];

  return {
    async listServices() {
      return services;
    },
    async getService(id) {
      return services.find((s) => s.id === id) ?? null;
    },
    async listBookings({ page, pageSize, status, date }) {
      const filtered = bookings
        .filter((b) => (!status || b.status === status) && (!date || b.startAt.startsWith(date)))
        .sort((a, b) => a.startAt.localeCompare(b.startAt));
      return { data: filtered.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: filtered.length };
    },
    async bookingsOnDay(date) {
      return bookings.filter((b) => b.startAt.startsWith(date));
    },
    async getBooking(id) {
      return bookings.find((b) => b.id === id) ?? null;
    },
    async createBooking(input) {
      const booking: Booking = { id: randomUUID(), ...input, status: 'confirmed', createdAt: new Date().toISOString() };
      bookings.push(booking);
      return booking;
    },
    async cancelBooking(id) {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) return null;
      booking.status = 'cancelled';
      return booking;
    },
  };
}
