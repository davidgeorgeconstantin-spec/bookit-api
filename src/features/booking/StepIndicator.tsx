import { motion } from 'motion/react';

const STEPS = ['Service', 'Time', 'Details', 'Done'];

export function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <motion.span
            animate={{ backgroundColor: i <= step ? '#059669' : '#e2e8f0', color: i <= step ? '#fff' : '#64748b', scale: i === step ? 1.12 : 1 }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold"
          >
            {i < step ? '✓' : i + 1}
          </motion.span>
          <span className={`hidden text-sm font-medium sm:inline ${i <= step ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
          {i < STEPS.length - 1 && (
            <span className="relative h-0.5 flex-1 overflow-hidden rounded bg-slate-200">
              <motion.span className="absolute inset-0 origin-left bg-emerald-600" initial={false} animate={{ scaleX: i < step ? 1 : 0 }} transition={{ duration: 0.4 }} />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
