import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { useBookings, useCancelBooking, useServices } from '@/hooks/useBookingApi';
import { dayLabel, timeUTC } from '@/lib/format';

type Filter = 'all' | 'confirmed' | 'cancelled';

export function BookingsTable() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading, isFetching } = useBookings(page, filter === 'all' ? undefined : filter);
  const { data: services } = useServices();
  const cancel = useCancelBooking();
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const serviceName = (id: string) => services?.find((s) => s.id === id)?.name ?? id;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Bookings {data && <span className="text-slate-400">({data.total})</span>}</h2>
        <Tabs
          layoutId="filter-pill"
          active={filter}
          onChange={(f) => {
            setFilter(f);
            setPage(1);
          }}
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : data && data.data.length === 0 ? (
        <p className="py-10 text-center text-slate-500">No bookings yet. Make one in the “Book” tab.</p>
      ) : (
        <motion.ul layout className={`space-y-2 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          <AnimatePresence mode="popLayout" initial={false}>
            {data?.data.map((b) => (
              <motion.li
                key={b.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3"
              >
                <div className="w-20 text-center">
                  <p className="text-xs text-slate-500">{dayLabel(b.startAt)}</p>
                  <p className="font-bold">{timeUTC(b.startAt)}</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{b.customerName}</p>
                  <p className="text-sm text-slate-500">{serviceName(b.serviceId)}</p>
                </div>
                <motion.span layout className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {b.status}
                </motion.span>
                {b.status === 'confirmed' && (
                  <Button variant="danger" onClick={() => cancel.mutate(b.id)} loading={cancel.isPending && cancel.variables === b.id}>
                    Cancel
                  </Button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <div className="mt-4 flex items-center justify-between text-sm">
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          ← Prev
        </Button>
        <span className="text-slate-500">
          Page {page} of {pages}
        </span>
        <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          Next →
        </Button>
      </div>
    </section>
  );
}
