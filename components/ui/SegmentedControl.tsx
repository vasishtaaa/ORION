'use client';
import React from 'react';
import { clsx } from 'clsx';

export interface Option<T extends string> {
  label: string;
  value: T;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={clsx(
        'inline-flex items-center p-1 rounded-xl bg-[#00140a]/90 border border-[rgba(80,200,120,0.18)] shadow-inner gap-1 select-none',
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              'inline-flex items-center justify-center font-mono font-bold tracking-wider rounded-lg transition-all duration-200 cursor-pointer',
              size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs',
              isSelected
                ? 'bg-[#50C878] text-black shadow-[0_0_15px_rgba(80,200,120,0.4)]'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(80,200,120,0.08)]'
            )}
          >
            {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
