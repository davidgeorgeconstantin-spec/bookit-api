import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { stepVariants } from '@/lib/motion';
import type { Booking, Service } from '@/types/api';
import { DetailsStep } from './DetailsStep';
import { ServiceStep } from './ServiceStep';
import { SlotStep } from './SlotStep';
import { StepIndicator } from './StepIndicator';
import { SuccessStep } from './SuccessStep';

/** Multi-step form. Each step slides in from the right (forward) or left (back). */
export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [startAt, setStartAt] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <StepIndicator step={step} />
      {step > 0 && step < 3 && (
        <button onClick={() => go(step - 1)} className="mb-3 text-sm text-slate-500 hover:text-slate-900">
          ← Back
        </button>
      )}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">
            {step === 0 && (
              <ServiceStep
                onSelect={(s) => {
                  setService(s);
                  go(1);
                }}
              />
            )}
            {step === 1 && service && (
              <SlotStep
                service={service}
                onSelect={(t) => {
                  setStartAt(t);
                  go(2);
                }}
              />
            )}
            {step === 2 && service && startAt && (
              <DetailsStep
                service={service}
                startAt={startAt}
                onDone={(b) => {
                  setBooking(b);
                  go(3);
                }}
              />
            )}
            {step === 3 && booking && <SuccessStep booking={booking} onReset={() => go(0)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
