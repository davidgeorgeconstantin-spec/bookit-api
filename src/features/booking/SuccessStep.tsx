import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { dayLabel, timeUTC } from '@/lib/format';
import type { Booking } from '@/types/api';

export function SuccessStep({ booking, onReset }: { booking: Booking; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <motion.svg width="96" height="96" viewBox="0 0 96 96" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
        <motion.circle cx="48" cy="48" r="44" fill="none" stroke="#059669" strokeWidth="6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.path d="M28 50l14 14 26-30" fill="none" stroke="#059669" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.4 }} />
      </motion.svg>
      {/* confetti dots */}
      <div className="relative h-0 w-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{ backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ec4899'][i % 4] }}
            initial={{ x: 0, y: -50, opacity: 1 }}
            animate={{ x: Math.cos(i) * 120, y: -50 + Math.sin(i) * 90 + 60, opacity: 0, rotate: 180 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
          />
        ))}
      </div>
      <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-4 text-2xl font-bold">
        You&apos;re booked!
      </motion.h3>
      <p className="mt-1 text-slate-600">
        {dayLabel(booking.startAt)} at {timeUTC(booking.startAt)} UTC · ID <code className="rounded bg-slate-100 px-1 text-xs">{booking.id.slice(0, 8)}</code>
      </p>
      <Button variant="ghost" className="mt-6" onClick={onReset}>
        Book another
      </Button>
    </div>
  );
}
