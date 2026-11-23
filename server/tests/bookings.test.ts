import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createMemoryRepository } from '../src/repositories/memoryRepository.js';

// A date safely in the future, at 10:00 UTC
const day = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
const at = (time: string) => `${day}T${time}:00.000Z`;

let app: ReturnType<typeof createApp>;
beforeEach(() => {
  app = createApp(createMemoryRepository()); // fresh, empty store for every test
});

const valid = { serviceId: 'haircut', customerName: 'Ana Popescu', customerEmail: 'ana@example.com', startAt: at('10:00') };

describe('BookIt API', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('lists services', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('creates a booking (201) with a Location header', async () => {
    const res = await request(app).post('/api/bookings').send(valid);
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(/^\/api\/bookings\//);
    expect(res.body.data.endAt).toBe(at('10:30'));
  });

  it('rejects invalid input with 400', async () => {
    const res = await request(app).post('/api/bookings').send({ ...valid, customerEmail: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.details.customerEmail).toBeDefined();
  });

  it('rejects overlapping bookings with 409', async () => {
    await request(app).post('/api/bookings').send(valid);
    const res = await request(app).post('/api/bookings').send({ ...valid, startAt: at('10:15') });
    expect(res.status).toBe(409);
  });

  it('rejects bookings outside opening hours with 422', async () => {
    const res = await request(app).post('/api/bookings').send({ ...valid, startAt: at('20:00') });
    expect(res.status).toBe(422);
  });

  it('marks booked slots as unavailable', async () => {
    await request(app).post('/api/bookings').send(valid);
    const res = await request(app).get(`/api/slots?serviceId=haircut&date=${day}`);
    const slot = res.body.data.find((s: { startAt: string }) => s.startAt === at('10:00'));
    expect(slot.available).toBe(false);
  });

  it('cancels a booking and frees the slot', async () => {
    const created = await request(app).post('/api/bookings').send(valid);
    const res = await request(app).patch(`/api/bookings/${created.body.data.id}/cancel`);
    expect(res.body.data.status).toBe('cancelled');
    const again = await request(app).post('/api/bookings').send(valid);
    expect(again.status).toBe(201);
  });

  it('paginates the booking list', async () => {
    for (const t of ['09:00', '10:00', '11:00']) await request(app).post('/api/bookings').send({ ...valid, startAt: at(t) });
    const res = await request(app).get('/api/bookings?page=2&pageSize=2');
    expect(res.body.total).toBe(3);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });
});
