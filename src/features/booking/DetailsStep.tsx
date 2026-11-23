import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useCreateBooking } from '@/hooks/useBookingApi';
import { dayLabel, money, timeUTC } from '@/lib/format';
import { ApiError, type Booking, type Service } from '@/types/api';

// The same rules as the server, checked in the browser first for instant feedback.
const schema = z.object({
  customerName: z.string().trim().min(2, 'Please enter at least 2 characters'),
  customerEmail: z.string().trim().email('Please enter a valid email'),
});
type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

interface Props {
  service: Service;
  startAt: string;
  onDone: (b: Booking) => void;
}

export function DetailsStep({ service, startAt, onDone }: Props) {
  const [form, setForm] = useState({ customerName: '', customerEmail: '' });
  const [errors, setErrors] = useState<Errors>({});
  const create = useCreateBooking();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ customerName: f.customerName?.[0], customerEmail: f.customerEmail?.[0] });
      return;
    }
    setErrors({});
    create.mutate({ serviceId: service.id, startAt, ...parsed.data }, { onSuccess: onDone });
  }

  const apiError = create.error instanceof ApiError ? create.error : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="rounded-2xl bg-emerald-50 p-4 text-sm">
        <b>{service.name}</b> · {dayLabel(startAt)} at {timeUTC(startAt)} UTC · {money(service.price)}
      </div>
      {(['customerName', 'customerEmail'] as const).map((field) => (
        <label key={field} className="block">
          <span className="text-sm font-medium text-slate-700">{field === 'customerName' ? 'Your name' : 'Email'}</span>
          <motion.input
            animate={errors[field] ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            type={field === 'customerEmail' ? 'email' : 'text'}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className={`mt-1 w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-4 ${errors[field] ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'}`}
            placeholder={field === 'customerName' ? 'Ana Popescu' : 'ana@example.com'}
          />
          <AnimatePresence>
            {errors[field] && (
              <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="block text-sm text-rose-600">
                {errors[field]}
              </motion.span>
            )}
          </AnimatePresence>
        </label>
      ))}
      <AnimatePresence>
        {apiError && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {apiError.status} · {apiError.message}
          </motion.p>
        )}
      </AnimatePresence>
      <Button type="submit" loading={create.isPending} className="w-full">
        Confirm booking
      </Button>
    </form>
  );
}
