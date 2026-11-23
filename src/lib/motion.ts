import type { Variants } from 'motion/react';

export const spring = { type: 'spring', stiffness: 320, damping: 28 } as const;

/** Slide direction depends on whether we go forward or back in the wizard. */
export const stepVariants: Variants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: spring },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0, transition: { duration: 0.18 } }),
};

export const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
export const pop: Variants = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1, transition: spring } };
