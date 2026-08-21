'use client';
import React from 'react';
import { GlassCard } from './GlassCard';
import { ChangeBadge } from './Badges';
import { clsx } from 'clsx';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: number;
  changePct?: number;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subValue,
  change,
  changePct,
  icon,
  badge,
  trend,
  className,
}: MetricCardProps) {
  return (
    <GlassCard hoverEffect className={clsx('p-4 sm:p-5 flex flex-col justify-between gap-3 sm:gap-4 w-full min-w-0 bg-[#0e131d]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-visible', className)}>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="w-fit max-w-full inline-flex shrink-0 items-center justify-center rounded-md px-3 py-1 text-xs font-mono font-semibold tracking-wider text-[var(--text-secondary)] uppercase bg-black/30 border border-white/5 truncate">
          {title}
        </span>
        {icon && <span className="text-[var(--matrix)] opacity-80 shrink-0">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap min-w-0">
        <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xl sm:text-2xl font-mono font-extrabold tracking-tight text-white truncate">
            {value}
          </span>
          {subValue && (
            <span className="text-[11px] sm:text-xs font-mono text-[var(--text-muted)] truncate hidden xs:inline">
              {subValue}
            </span>
          )}
        </div>

        {changePct !== undefined || change !== undefined ? (
          <ChangeBadge change={change} changePct={changePct} />
        ) : (
          badge && <div className="shrink-0">{badge}</div>
        )}
      </div>
    </GlassCard>
  );
}
