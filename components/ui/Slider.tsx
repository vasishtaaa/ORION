'use client';
import React from 'react';
import { clsx } from 'clsx';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={clsx('w-full flex flex-col space-y-2 p-3 rounded-xl bg-[#0a0d14]/70 border border-white/5', className)}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[var(--text-secondary)] font-medium truncate pr-2">{label}</span>
        <span className="w-fit px-2.5 py-0.5 rounded-md bg-[#001f11] border border-[rgba(80,200,120,0.3)] text-[#00ff87] font-bold text-xs shrink-0">
          {value}{unit}
        </span>
      </div>

      <div className="relative flex items-center h-5 w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-[#001a0d] rounded-lg appearance-none cursor-pointer accent-[#50C878] focus:outline-none"
          style={{
            background: `linear-gradient(to right, #50C878 0%, #00ff87 ${percentage}%, #001a0d ${percentage}%, #001a0d 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
