export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Slot {
  startAt: string;
  available: boolean;
}

export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface ApiResponse {
  status: number;
  body: unknown;
}

export interface LogEntry {
  id: number;
  method: HttpMethod;
  path: string;
  status: number;
  ms: number;
  requestBody?: unknown;
  responseBody: unknown;
  at: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}
