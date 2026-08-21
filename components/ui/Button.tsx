'use client';
import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'w-fit max-w-full inline-flex shrink-0 items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-full whitespace-nowrap';

    const variants = {
      primary: 'bg-[#50C878] text-black hover:bg-[#00ff87] shadow-[0_0_20px_rgba(80,200,120,0.35)] hover:shadow-[0_0_30px_rgba(0,255,135,0.6)] border border-[#00ff87]/30 active:scale-[0.98]',
      secondary: 'bg-[#0e131d]/90 text-[#f0fff8] hover:text-white border border-white/15 hover:border-[#50C878] hover:bg-[#141b29] shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-[0.98]',
      danger: 'bg-red-950/50 text-red-400 border border-red-500/30 hover:bg-red-900/60 hover:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)] active:scale-[0.98]',
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[#00ff87] hover:bg-white/5 border border-transparent',
      glass: 'glass-pill text-[var(--text-primary)] hover:border-[#50C878] hover:text-white',
    };

    const sizes = {
      sm: 'text-xs px-3.5 sm:px-4 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 gap-2',
      lg: 'text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
