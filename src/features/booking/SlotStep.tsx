import { motion } from 'motion/react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSlots } from '@/hooks/useBookingApi';
import { cn } from '@/lib/cn';
import { dayLabel, nextDays, timeUTC } from '@/lib/format';
import { pop, stagger } from '@/lib/motion';
import type { Service } from '@/types/api';

interface Props {
  service: Service;
  onSelect: (startAt: string) => void;
}

const DAYS = nextDays(7);

export function SlotStep({ service, onSelect }: Props) {
  const [date, setDate] = useState(DAYS[0]!);
  const { data: slots, isLoading } = useSlots(service.id, date);

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((d) => (
          <button key={d} onClick={() => setDate(d)} className="relative shrink-0 rounded-xl px-3 py-2 text-sm font-medium">
            {d === date && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-xl bg-emerald-600" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            <span className={cn('relative', d === date ? 'text-white' : 'text-slate-600')}>{dayLabel(d)}</span>
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-slate-500">Times are shown in UTC · {service.name}, {service.duration} min</p>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : (
        <motion.div key={date} variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots?.map((s) => (
            <motion.button
              key={s.startAt}
              variants={pop}
              whileHover={s.available ? { scale: 1.06 } : undefined}
              whileTap={s.available ? { scale: 0.95 } : undefined}
              disabled={!s.available}
              onClick={() => onSelect(s.startAt)}
              className={cn('rounded-xl border py-2 text-sm font-semibold', s.available ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'border-slate-100 bg-slate-50 text-slate-300 line-through')}
            >
              {timeUTC(s.startAt)}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
