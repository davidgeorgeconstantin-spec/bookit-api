import type { Booking, Page, Service, Slot } from '@/types/api';
import { request } from './client';

export const api = {
  services: () => request<{ data: Service[] }>('GET', '/api/services').then((r) => r.data),
  slots: (serviceId: string, date: string) => request<{ data: Slot[] }>('GET', `/api/slots?serviceId=${serviceId}&date=${date}`).then((r) => r.data),
  bookings: (page: number, status?: string) =>
    request<Page<Booking>>('GET', `/api/bookings?page=${page}&pageSize=5${status ? `&status=${status}` : ''}`),
  create: (input: { serviceId: string; customerName: string; customerEmail: string; startAt: string }) =>
    request<{ data: Booking }>('POST', '/api/bookings', input).then((r) => r.data),
  cancel: (id: string) => request<{ data: Booking }>('PATCH', `/api/bookings/${id}/cancel`).then((r) => r.data),
};
