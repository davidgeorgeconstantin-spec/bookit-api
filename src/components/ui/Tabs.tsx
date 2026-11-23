import { motion } from 'motion/react';

interface TabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  layoutId: string;
}

/** Generic tabs: the white background slides between tabs (shared layout animation). */
export function Tabs<T extends string>({ tabs, active, onChange, layoutId }: TabsProps<T>) {
  return (
    <div role="tablist" className="inline-flex rounded-xl bg-slate-100 p-1">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => onChange(t.id)} className="relative rounded-lg px-4 py-1.5 text-sm font-semibold">
          {active === t.id && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
          <span className={`relative ${active === t.id ? 'text-slate-900' : 'text-slate-500'}`}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
