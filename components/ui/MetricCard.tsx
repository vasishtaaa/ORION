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
    <GlassCard hoverEffect className={clsx('p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-2.5 sm:gap-3 w-full min-w-0', className)}>
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-[var(--text-secondary)] uppercase truncate">
          {title}
        </span>
        {icon && <span className="text-[var(--matrix)] opacity-80 flex-shrink-0">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap min-w-0">
        <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
          <span className="text-lg sm:text-xl lg:text-2xl font-mono font-extrabold tracking-tight text-[var(--text-primary)] truncate">
            {value}
          </span>
          {subValue && (
            <span className="text-[10px] sm:text-xs font-mono text-[var(--text-muted)] truncate hidden xs:inline">
              {subValue}
            </span>
          )}
        </div>

        {changePct !== undefined || change !== undefined ? (
          <ChangeBadge change={change} changePct={changePct} />
        ) : (
          badge && <div className="flex-shrink-0">{badge}</div>
        )}
      </div>
    </GlassCard>
  );
}
