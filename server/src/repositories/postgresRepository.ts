import { randomUUID } from 'node:crypto';
import pg from 'pg';
import type { BookingRepository } from './types.js';
import type { Booking, Service } from '../domain/types.js';

interface BookingRow {
  id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  start_at: Date;
  end_at: Date;
  status: Booking['status'];
  created_at: Date;
}

const toBooking = (r: BookingRow): Booking => ({
  id: r.id,
  serviceId: r.service_id,
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  startAt: r.start_at.toISOString(),
  endAt: r.end_at.toISOString(),
  status: r.status,
  createdAt: r.created_at.toISOString(),
});

/** PostgreSQL implementation. All queries use parameters ($1, $2…) to prevent SQL injection. */
export function createPostgresRepository(connectionString: string): BookingRepository {
  const pool = new pg.Pool({ connectionString, ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false } });

  return {
    async listServices() {
      const { rows } = await pool.query<Service>('SELECT id, name, duration, price::float AS price FROM services ORDER BY name');
      return rows;
    },
    async getService(id) {
      const { rows } = await pool.query<Service>('SELECT id, name, duration, price::float AS price FROM services WHERE id = $1', [id]);
      return rows[0] ?? null;
    },
    async listBookings({ page, pageSize, status, date }) {
      const where: string[] = [];
      const params: unknown[] = [];
      if (status) where.push(`status = $${params.push(status)}`);
      if (date) where.push(`start_at::date = $${params.push(date)}`);
      const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const total = await pool.query<{ count: string }>(`SELECT count(*) FROM bookings ${clause}`, params);
      const { rows } = await pool.query<BookingRow>(
        `SELECT * FROM bookings ${clause} ORDER BY start_at LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, (page - 1) * pageSize],
      );
      return { data: rows.map(toBooking), page, pageSize, total: Number(total.rows[0]?.count ?? 0) };
    },
    async bookingsOnDay(date) {
      const { rows } = await pool.query<BookingRow>('SELECT * FROM bookings WHERE start_at::date = $1', [date]);
      return rows.map(toBooking);
    },
    async getBooking(id) {
      const { rows } = await pool.query<BookingRow>('SELECT * FROM bookings WHERE id = $1', [id]);
      return rows[0] ? toBooking(rows[0]) : null;
    },
    async createBooking(input) {
      const { rows } = await pool.query<BookingRow>(
        `INSERT INTO bookings (id, service_id, customer_name, customer_email, start_at, end_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [randomUUID(), input.serviceId, input.customerName, input.customerEmail, input.startAt, input.endAt],
      );
      return toBooking(rows[0]!);
    },
    async cancelBooking(id) {
      const { rows } = await pool.query<BookingRow>(`UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`, [id]);
      return rows[0] ? toBooking(rows[0]) : null;
    },
  };
}
