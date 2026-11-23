import { motion } from 'motion/react';
import { pop, stagger } from '@/lib/motion';

const ENDPOINTS = [
  { method: 'GET', path: '/api/health', desc: 'Health check' },
  { method: 'GET', path: '/api/services', desc: 'List services' },
  { method: 'GET', path: '/api/slots?serviceId&date', desc: 'Free / taken time slots for a day' },
  { method: 'GET', path: '/api/bookings?page&pageSize&status', desc: 'Paginated list of bookings' },
  { method: 'GET', path: '/api/bookings/:id', desc: 'One booking' },
  { method: 'POST', path: '/api/bookings', desc: 'Create a booking (400 invalid · 409 overlap · 422 closed)' },
  { method: 'PATCH', path: '/api/bookings/:id/cancel', desc: 'Cancel a booking' },
] as const;

const COLORS = { GET: 'bg-sky-100 text-sky-700', POST: 'bg-emerald-100 text-emerald-700', PATCH: 'bg-amber-100 text-amber-700' } as const;

export function EndpointList() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-bold">REST endpoints</h2>
      <p className="mb-4 text-sm text-slate-500">
        Implemented in <code>/server</code> (Express + Zod + PostgreSQL) with Swagger docs at <code>/docs</code>. This demo runs the same rules in a mock server in your browser.
      </p>
      <motion.ul variants={stagger} initial="hidden" animate="show" className="space-y-2">
        {ENDPOINTS.map((e) => (
          <motion.li key={e.method + e.path} variants={pop} whileHover={{ x: 4 }} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3">
            <span className={`w-16 rounded-md py-0.5 text-center font-mono text-xs font-bold ${COLORS[e.method]}`}>{e.method}</span>
            <code className="text-sm font-semibold">{e.path}</code>
            <span className="text-sm text-slate-500">{e.desc}</span>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
