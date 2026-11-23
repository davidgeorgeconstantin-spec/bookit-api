import type { Booking, Service } from './types.js';

export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 18;
export const SLOT_STEP_MINUTES = 30;

/** Two time ranges overlap when each one starts before the other ends. */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

/** All start times for a service on a day, marking the ones that are already taken. */
export function buildSlots(date: string, service: Service, bookings: Booking[]) {
  const slots: { startAt: string; available: boolean }[] = [];
  const active = bookings.filter((b) => b.status === 'confirmed');
  for (let minutes = OPENING_HOUR * 60; minutes + service.duration <= CLOSING_HOUR * 60; minutes += SLOT_STEP_MINUTES) {
    const start = new Date(`${date}T00:00:00Z`);
    start.setUTCMinutes(minutes);
    const end = new Date(start.getTime() + service.duration * 60_000);
    const taken = active.some((b) => overlaps(start, end, new Date(b.startAt), new Date(b.endAt)));
    slots.push({ startAt: start.toISOString(), available: !taken && start.getTime() > Date.now() });
  }
  return slots;
}
