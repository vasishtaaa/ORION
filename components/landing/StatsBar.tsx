'use client';
import React from 'react';

/**
 * StatsBar — Redesigned as a single seamless floating pill bar.
 *
 * Old design: 4 separate text blocks in a grid.
 * New design: One continuous glass pill with vertical dividers between metrics.
 *   - Values: JetBrains Mono, large, emerald text-shadow glow
 *   - Labels: Inter, xs, muted
 *   - Dividers: 1px rgba(255,255,255,0.08) vertical lines
 *   - Container: frosted glass, rounded-full, max-w-5xl centered
 */

const STATS = [
  { value: '< 640 µs',   label: 'P50 Latency',       sub: 'Sub-millisecond cycle'    },
  { value: '12,480',      label: 'Pkts / Sec',         sub: 'Peak ingestion throughput'},
  { value: '99.99%',     label: 'Telemetry Uptime',   sub: 'High availability'        },
  { value: '88.4%',      label: 'AI Confidence',      sub: 'Gemini quant consensus'   },
];

export function StatsBar() {
  return (
    <section className="w-full flex justify-center px-6 sm:px-8 lg:px-12" style={{ paddingTop: '0', paddingBottom: '0', position: 'relative', zIndex: 20 }}>
      <div
        className="w-full max-w-5xl"
        style={{
          background: 'rgba(10, 16, 30, 0.8)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '9999px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.6), 0 0 60px rgba(16,185,129,0.05)',
        }}
      >
        <div className="flex flex-wrap items-center">
          {STATS.map((s, idx) => (
            <React.Fragment key={idx}>
              {/* Divider (rendered as a separate element to allow wrapping) */}
              {idx > 0 && (
                <div className="w-px hidden sm:block self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />
              )}
              <div className="flex-1 min-w-[140px] flex flex-col items-center text-center py-5 px-6">
                <span
                  className="font-mono text-2xl sm:text-3xl font-black tracking-tight"
                  style={{
                    color: '#10b981',
                    textShadow: '0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.2)',
                  }}
                >
                  {s.value}
                </span>
                <span className="font-mono text-[11px] font-bold text-white uppercase tracking-widest mt-1">
                  {s.label}
                </span>
                <span className="font-sans text-[10px] mt-0.5" style={{ color: 'rgba(240,253,244,0.35)' }}>
                  {s.sub}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
