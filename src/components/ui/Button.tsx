import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-[#312E81] hover:bg-[#252262] text-white shadow-sm hover:shadow active:scale-[0.98]',
      secondary:
        'bg-indigo-50 hover:bg-indigo-100 text-[#312E81] border border-indigo-100',
      outline:
        'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm',
      ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
      emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg font-medium',
      md: 'px-4 py-2.5 text-sm rounded-xl font-semibold',
      lg: 'px-6 py-3 text-base rounded-xl font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Yükleniyor...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
