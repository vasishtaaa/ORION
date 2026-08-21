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
    <GlassCard hoverEffect className={clsx('p-4 md:p-5 flex flex-col justify-between gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
          {title}
        </span>
        {icon && <span className="text-[var(--matrix)] opacity-80">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-mono font-extrabold tracking-tight text-[var(--text-primary)]">
            {value}
          </span>
          {subValue && (
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {subValue}
            </span>
          )}
        </div>

        {changePct !== undefined || change !== undefined ? (
          <ChangeBadge change={change} changePct={changePct} />
        ) : (
          badge && <div>{badge}</div>
        )}
      </div>
    </GlassCard>
  );
}
