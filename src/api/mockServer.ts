/**
 * In-browser mock of the BookIt REST API (same routes, rules and status codes as /server).
 * It lets the live demo work on GitHub Pages, where no Node server can run.
 * Data is stored in localStorage.
 */
import type { ApiResponse, Booking, HttpMethod, Service } from '@/types/api';

const SERVICES: Service[] = [
  { id: 'haircut', name: 'Haircut', duration: 30, price: 60 },
  { id: 'beard', name: 'Beard trim', duration: 20, price: 35 },
  { id: 'massage', name: 'Relax massage', duration: 60, price: 150 },
  { id: 'consult', name: 'Style consultation', duration: 45, price: 90 },
];
const OPEN = 9;
const CLOSE = 18;
const STEP = 30;
const KEY = 'bookit:bookings';

const load = (): Booking[] => JSON.parse(localStorage.getItem(KEY) ?? '[]') as Booking[];
const save = (b: Booking[]) => localStorage.setItem(KEY, JSON.stringify(b));
const json = (status: number, body: unknown): ApiResponse => ({ status, body });
const overlaps = (a1: Date, a2: Date, b1: Date, b2: Date) => a1 < b2 && b1 < a2;
const isDate = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slots(date: string, service: Service, bookings: Booking[]) {
  const out: { startAt: string; available: boolean }[] = [];
  for (let m = OPEN * 60; m + service.duration <= CLOSE * 60; m += STEP) {
    const start = new Date(`${date}T00:00:00Z`);
    start.setUTCMinutes(m);
    const end = new Date(start.getTime() + service.duration * 60_000);
    const taken = bookings.some((b) => b.status === 'confirmed' && overlaps(start, end, new Date(b.startAt), new Date(b.endAt)));
    out.push({ startAt: start.toISOString(), available: !taken && start.getTime() > Date.now() });
  }
  return out;
}

export function handle(method: HttpMethod, url: string, body?: unknown): ApiResponse {
  const { pathname, searchParams: q } = new URL(url, 'http://mock');
  const bookings = load();

  if (method === 'GET' && pathname === '/api/health') return json(200, { status: 'ok', time: new Date().toISOString() });
  if (method === 'GET' && pathname === '/api/services') return json(200, { data: SERVICES });

  if (method === 'GET' && pathname === '/api/slots') {
    const service = SERVICES.find((s) => s.id === q.get('serviceId'));
    const date = q.get('date');
    if (!isDate(date)) return json(400, { error: 'Validation failed', details: { date: ['date must be YYYY-MM-DD'] } });
    if (!service) return json(404, { error: 'Service not found' });
    return json(200, { data: slots(date, service, bookings.filter((b) => b.startAt.startsWith(date))) });
  }

  if (method === 'GET' && pathname === '/api/bookings') {
    const page = Math.max(1, Number(q.get('page') ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 10)));
    const status = q.get('status');
    const list = bookings.filter((b) => !status || b.status === status).sort((a, b) => a.startAt.localeCompare(b.startAt));
    return json(200, { data: list.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: list.length });
  }

  if (method === 'POST' && pathname === '/api/bookings') {
    const input = (body ?? {}) as Partial<Record<'serviceId' | 'customerName' | 'customerEmail' | 'startAt', string>>;
    const details: Record<string, string[]> = {};
    if (!input.customerName || input.customerName.trim().length < 2) details.customerName = ['Name must have at least 2 characters'];
    if (!input.customerEmail || !EMAIL.test(input.customerEmail)) details.customerEmail = ['Invalid email'];
    if (!input.startAt || Number.isNaN(Date.parse(input.startAt))) details.startAt = ['startAt must be an ISO date-time'];
    if (Object.keys(details).length) return json(400, { error: 'Validation failed', details });
    const service = SERVICES.find((s) => s.id === input.serviceId);
    if (!service) return json(404, { error: 'Service not found' });
    const start = new Date(input.startAt!);
    const end = new Date(start.getTime() + service.duration * 60_000);
    if (start.getTime() <= Date.now()) return json(422, { error: 'Booking must be in the future' });
    const conflict = bookings.some((b) => b.status === 'confirmed' && overlaps(start, end, new Date(b.startAt), new Date(b.endAt)));
    if (conflict) return json(409, { error: 'This time slot is already booked' });
    const booking: Booking = {
      id: crypto.randomUUID(),
      serviceId: service.id,
      customerName: input.customerName!.trim(),
      customerEmail: input.customerEmail!.trim(),
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    save([...bookings, booking]);
    return json(201, { data: booking });
  }

  const cancel = pathname.match(/^\/api\/bookings\/([\w-]+)\/cancel$/);
  if (method === 'PATCH' && cancel) {
    const b = bookings.find((x) => x.id === cancel[1]);
    if (!b) return json(404, { error: 'Booking not found' });
    b.status = 'cancelled';
    save(bookings);
    return json(200, { data: b });
  }

  return json(404, { error: `Route ${method} ${pathname} not found` });
}
