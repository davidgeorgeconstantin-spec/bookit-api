import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useServices } from '@/hooks/useBookingApi';
import { money } from '@/lib/format';
import { pop, stagger } from '@/lib/motion';
import type { Service } from '@/types/api';

const ICONS: Record<string, string> = { haircut: '✂️', beard: '🧔', massage: '💆', consult: '💬' };

export function ServiceStep({ onSelect }: { onSelect: (s: Service) => void }) {
  const { data, isLoading } = useServices();
  if (isLoading) return <div className="grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>;

  return (
    <motion.ul variants={stagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
      {data?.map((s) => (
        <motion.li key={s.id} variants={pop}>
          <motion.button
            whileHover={{ y: -4, boxShadow: '0 12px 30px -12px rgba(5,150,105,0.35)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(s)}
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-emerald-400"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-2xl">{ICONS[s.id] ?? '📅'}</span>
            <span className="flex-1">
              <span className="block font-semibold">{s.name}</span>
              <span className="text-sm text-slate-500">{s.duration} min</span>
            </span>
            <span className="font-bold text-emerald-700">{money(s.price)}</span>
          </motion.button>
        </motion.li>
      ))}
    </motion.ul>
  );
}
