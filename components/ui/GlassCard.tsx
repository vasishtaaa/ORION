'use client';
import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'elevated' | 'glow';
  hoverEffect?: boolean;
}

export function GlassCard({
  className,
  variant = 'default',
  hoverEffect = false,
  children,
  ...props
}: GlassCardProps) {
  const baseStyles = 'rounded-2xl relative overflow-hidden backdrop-blur-xl border transition-all duration-300';

  const variants = {
    default: 'bg-[#000e07]/85 border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
    subtle: 'bg-[#00140a]/60 border-[rgba(80,200,120,0.10)] shadow-[0_4px_20px_rgba(0,0,0,0.35)]',
    elevated: 'bg-[#001008]/95 border-[rgba(80,200,120,0.25)] shadow-[0_12px_40px_rgba(0,0,0,0.7)]',
    glow: 'bg-[#000e07]/90 border-[rgba(0,255,135,0.3)] shadow-[0_0_30px_rgba(0,255,135,0.15),0_8px_32px_rgba(0,0,0,0.6)]',
  };

  const hoverStyles = hoverEffect ? 'hover:border-[rgba(80,200,120,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(80,200,120,0.15)] hover:-translate-y-0.5' : '';

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], hoverStyles, className))} {...props}>
      {children}
    </div>
  );
}

export function GlassCardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('p-4 md:p-5 border-b border-[rgba(80,200,120,0.12)] flex items-center justify-between gap-4', className))} {...props}>
      {children}
    </div>
  );
}

export function GlassCardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('p-4 md:p-5', className))} {...props}>
      {children}
    </div>
  );
}
