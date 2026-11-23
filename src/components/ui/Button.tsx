import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/cn';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, className, children, disabled, ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-slate-300',
    ghost: 'border border-slate-200 bg-white hover:bg-slate-50',
    danger: 'text-rose-600 hover:bg-rose-50',
  }[variant];
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed', styles, className)}
      {...props}
    >
      {loading && <motion.span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />}
      {children as React.ReactNode}
    </motion.button>
  );
}
