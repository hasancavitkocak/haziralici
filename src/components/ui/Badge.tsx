import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'indigo' | 'slate' | 'amber';
  children: React.ReactNode;
}

export const Badge = ({
  variant = 'emerald',
  className,
  children,
  ...props
}: BadgeProps) => {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
