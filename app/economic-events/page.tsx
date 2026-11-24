'use client';
import React, { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MarketStatusBadge } from '@/components/ui/MarketStatusBadge';
import { DataDisclaimer } from '@/components/ui/DataDisclaimer';
import { Globe, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const T = { emerald: '#10b981', cyan: '#06b6d4', amber: '#fbbf24', red: '#ef4444', purple: '#818cf8' } as const;
const glass = { background: 'rgba(14,19,29,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' } as const;

type Impact = 'high' | 'medium' | 'low';

interface EconomicEvent {
  date: string;
  time: string;
  event: string;
  country: string;
  impact: Impact;
  description: string;
  source: string;
}

/*
  NOTE: These events are STRUCTURAL REFERENCE EXAMPLES showing the calendar UI.
  Dates are plausible based on typical NSE/global macro calendars but are NOT
  guaranteed accurate. Connect a live economic calendar API for real data.
*/
const EVENTS: EconomicEvent[] = [
  {
    date: '2026-10-02', time: '10:00 IST', event: 'RBI Monetary Policy Committee Meeting (Day 1)',
    country: 'IN', impact: 'high',
    description: 'Three-day MPC meeting. Decision announced on the final day. Key focus: repo rate and stance.',
    source: 'Reserve Bank of India',
  },
  {
    date: '2026-10-04', time: '10:00 IST', event: 'RBI MPC Rate Decision',
    country: 'IN', impact: 'high',
    description: 'RBI announces repo rate decision and forward guidance. High market impact expected.',
    source: 'Reserve Bank of India',
  },
  {
    date: '2026-10-15', time: '17:30 IST', event: 'India WPI Inflation (September)',
    country: 'IN', impact: 'medium',
    description: 'Wholesale Price Index for September 2026. Measures input cost inflation across sectors.',
    source: 'Ministry of Commerce & Industry',
  },
  {
    date: '2026-10-16', time: '17:30 IST', event: 'India CPI Inflation (September)',
    country: 'IN', impact: 'high',
    description: 'Consumer Price Index for September. Key indicator for RBI policy and real return calculations.',
    source: 'Ministry of Statistics (MOSPI)',
  },
  {
    date: '2026-10-17', time: '10:30 IST', event: 'India IIP (August)',
    country: 'IN', impact: 'medium',
    description: 'Index of Industrial Production for August 2026. Measures manufacturing and industrial output.',
    source: 'Ministry of Statistics (MOSPI)',
  },
  {
    date: '2026-10-22', time: '20:00 IST', event: 'US Federal Reserve Beige Book',
    country: 'US', impact: 'medium',
    description: 'Fed Beige Book economic commentary on current US economic conditions across all 12 districts.',
    source: 'US Federal Reserve',
  },
  {
    date: '2026-10-28', time: '18:30 IST', event: 'US GDP (Q3 2026 Advance)',
    country: 'US', impact: 'high',
    description: 'Advance estimate of US Q3 GDP growth. Significant impact on global risk sentiment and Indian IT sector.',
    source: 'Bureau of Economic Analysis',
  },
  {
    date: '2026-11-07', time: '01:00 IST', event: 'US FOMC Rate Decision',
    country: 'US', impact: 'high',
    description: 'Federal Open Market Committee interest rate decision. Dollar and global market sentiment impact.',
    source: 'US Federal Reserve',
  },
  {
    date: '2026-11-14', time: '19:00 IST', event: 'US CPI (October)',
    country: 'US', impact: 'high',
    description: 'US Consumer Price Index for October 2026. Key inflation metric affecting Fed trajectory.',
    source: 'Bureau of Labor Statistics',
  },
  {
    date: '2026-11-28', time: '17:30 IST', event: 'India GDP (Q2 FY27)',
    country: 'IN', impact: 'high',
    description: 'Second quarter FY2027 GDP growth estimate. Key macro indicator for India equity markets.',
    source: 'Ministry of Statistics (MOSPI)',
  },
];

const IMPACT_CONFIG: Record<Impact, { color: string; bg: string; border: string; label: string }> = {
  high:   { color: T.red,    bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',    label: 'High Impact'   },
  medium: { color: T.amber,  bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',   label: 'Medium Impact' },
  low:    { color: T.cyan,   bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.3)',    label: 'Low Impact'    },
};

const COUNTRY_FLAG: Record<string, string> = { IN: '🇮🇳', US: '🇺🇸', EU: '🇪🇺', JP: '🇯🇵', GB: '🇬🇧' };

export default function EconomicEventsPage() {
  const { status, activeTicker, selectTicker } = useVortexSocket();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<Impact | 'all'>('all');

  const filtered = EVENTS.filter((e) => filter === 'all' || e.impact === filter);

  return (
    <div className="min-h-screen flex flex-col text-white w-full" style={{ background: '#030712' }}>
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/economic-events" onTickerSelect={selectTicker} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: 'Economic Events' }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight flex items-center gap-2.5">
                <Globe className="w-6 h-6" style={{ color: T.cyan }} aria-hidden="true" />
                Economic Events Calendar
              </h1>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                RBI, MOSPI, Fed, and global macro events affecting Indian equity markets
              </p>
            </div>
            <MarketStatusBadge />
          </div>
        </div>

        {/* Reference notice */}
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono"
          style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', color: 'var(--text-muted)' }}
          role="note"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: T.amber }} aria-hidden="true" />
          <span>
            <strong className="text-white">Reference calendar:</strong> Dates and events shown are indicative based on typical macro reporting schedules. Connect a live economic calendar API for precise, real-time event data. Always verify with official sources before trading decisions.
          </span>
        </div>

        {/* Impact filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Filter by impact:</span>
          {(['all', 'high', 'medium', 'low'] as const).map((f) => {
            const cfg = f === 'all' ? null : IMPACT_CONFIG[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer capitalize"
                style={filter === f ? {
                  background: cfg?.bg || 'rgba(16,185,129,0.15)',
                  color: cfg?.color || T.emerald,
                  border: `1px solid ${cfg?.border || 'rgba(16,185,129,0.4)'}`,
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                aria-pressed={filter === f}
              >
                {f === 'all' ? 'All Events' : cfg?.label}
              </button>
            );
          })}
        </div>

        {/* Events list */}
        <div className="flex flex-col gap-3">
          {filtered.map((event, idx) => {
            const cfg = IMPACT_CONFIG[event.impact];
            const isOpen = expanded === idx;
            return (
              <div key={idx} className="flex flex-col" style={glass}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : idx)}
                  className="flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/[0.02] cursor-pointer w-full"
                  aria-expanded={isOpen}
                >
                  {/* Date */}
                  <div className="shrink-0 flex flex-col items-center text-center w-12">
                    <span className="text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                      {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-xl font-mono font-black text-white leading-tight">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-sans font-bold">{COUNTRY_FLAG[event.country] || '🌐'}</span>
                      <span
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="font-mono font-bold text-sm text-white leading-snug">{event.event}</p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      {event.time} · {event.source}
                    </p>
                  </div>

                  {/* Expand toggle */}
                  <div className="shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      : <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    }
                  </div>
                </button>

                {/* Expanded description */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-sans leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>
                      {event.description}
                    </p>
                    <p className="text-[10px] font-mono mt-3" style={{ color: 'var(--text-muted)' }}>
                      Source: {event.source} · Date shown is indicative — verify with official source.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <Globe className="w-8 h-8" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>No events match the selected filter.</p>
          </div>
        )}

        <DataDisclaimer note="Economic event dates are indicative estimates based on typical reporting schedules. Verify with RBI, MOSPI, or relevant official sources before making trading decisions." />
      </main>
    </div>
  );
}
