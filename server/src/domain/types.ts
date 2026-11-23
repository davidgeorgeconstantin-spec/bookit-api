export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  startAt: string; // ISO date-time
  endAt: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
