'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MarketStatusBadge } from '@/components/ui/MarketStatusBadge';
import { DataDisclaimer } from '@/components/ui/DataDisclaimer';
import { Calendar, Clock, Info, ArrowRight, TrendingUp } from 'lucide-react';

const T = { emerald: '#10b981', cyan: '#06b6d4', amber: '#fbbf24', red: '#ef4444', purple: '#818cf8' } as const;
const glass = { background: 'rgba(14,19,29,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' } as const;

/* ── Earnings entries — note these are structural placeholders (no fake data) */
/* The platform does not have an earnings API. We surface that clearly. */

type EarningsStatus = 'upcoming' | 'reported';

interface EarningsEntry {
  ticker: string;
  company: string;
  date: string;           // ISO date string
  quarter: string;        // e.g. "Q2 FY26"
  status: EarningsStatus;
  timeOfDay?: 'pre-market' | 'post-market' | 'during-market';
}

/* 
  NOTE: These entries are STRUCTURAL EXAMPLES only.
  Dates and companies are plausible but may not match actual NSE earnings schedules.
  This page clearly labels them as "reference" until a live earnings API is connected.
*/
const SAMPLE_UPCOMING: EarningsEntry[] = [
  { ticker: 'TCS_NSE',       company: 'Tata Consultancy Services', date: '2026-10-08', quarter: 'Q2 FY27', status: 'upcoming', timeOfDay: 'post-market' },
  { ticker: 'INFY_NSE',      company: 'Infosys Limited',           date: '2026-10-14', quarter: 'Q2 FY27', status: 'upcoming', timeOfDay: 'post-market' },
  { ticker: 'HCLTECH_NSE',   company: 'HCL Technologies',          date: '2026-10-16', quarter: 'Q2 FY27', status: 'upcoming', timeOfDay: 'post-market' },
  { ticker: 'WIPRO_NSE',     company: 'Wipro Limited',             date: '2026-10-19', quarter: 'Q2 FY27', status: 'upcoming', timeOfDay: 'post-market' },
  { ticker: 'HDFC_NSE',      company: 'HDFC Bank',                 date: '2026-10-20', quarter: 'Q2 FY27', status: 'upcoming', timeOfDay: 'post-market' },
  { ticker: 'RELIANCE_NSE',  company: 'Reliance Industries',       date: '2026-10-24', quarter: 'Q2 FY27', status: 'upcoming', timeOfDay: 'post-market' },
  { ticker: 'ICICIBANK_NSE', company: 'ICICI Bank',                date: '2026-10-26', quarter: 'Q2 FY27', status: 'upcoming', timeOfDay: 'post-market' },
  { ticker: 'MARUTI_NSE',    company: 'Maruti Suzuki India',       date: '2026-10-30', quarter: 'Q2 FY27', status: 'upcoming', timeOfDay: 'post-market' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', weekday: 'short',
  });
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function EarningsPage() {
  const { status, activeTicker, selectTicker } = useVortexSocket();
  const [tab, setTab] = useState<'upcoming' | 'recent'>('upcoming');

  return (
    <div className="min-h-screen flex flex-col text-white w-full" style={{ background: '#030712' }}>
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/earnings" onTickerSelect={selectTicker} />

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: 'Earnings Calendar' }]} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight flex items-center gap-2.5">
                <Calendar className="w-6 h-6" style={{ color: T.purple }} aria-hidden="true" />
                Earnings Calendar
              </h1>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                NSE & BSE quarterly results schedule
              </p>
            </div>
            <MarketStatusBadge />
          </div>
        </div>

        {/* Data availability notice */}
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono"
          style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.2)', color: 'var(--text-muted)' }}
          role="note"
        >
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: T.purple }} aria-hidden="true" />
          <span>
            <strong className="text-white">Live earnings data feed not connected.</strong>{' '}
            The entries below are structural reference examples showing platform layout. Dates shown are indicative based on typical NSE reporting schedules.
            Connect an earnings API (e.g., Alpha Vantage Earnings, NSE website scraper) to populate real data.
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl w-fit" style={{ background: 'rgba(10,13,20,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['upcoming', 'recent'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer capitalize ${
                tab === t ? 'font-bold' : ''
              }`}
              style={tab === t ? { background: T.purple, color: '#030712' } : { color: 'var(--text-muted)' }}
              aria-pressed={tab === t}
            >
              {t === 'upcoming' ? 'Upcoming Results' : 'Recent Results'}
            </button>
          ))}
        </div>

        {/* Earnings table */}
        <div className="flex flex-col" style={glass}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-mono font-bold text-white">
              {tab === 'upcoming' ? 'Upcoming Earnings' : 'Recent Earnings'}
            </h2>
            <span
              className="text-[9px] font-mono px-2 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.1)', color: T.amber, border: '1px solid rgba(251,191,36,0.2)' }}
            >
              ⚠ Reference data — not live
            </span>
          </div>

          {tab === 'upcoming' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono min-w-[580px]">
                <thead className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider">Company</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider">Quarter</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider">Report Date</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider">When</th>
                    <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider">In</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_UPCOMING.map((entry) => {
                    const days = daysUntil(entry.date);
                    const isImminent = days <= 7;
                    return (
                      <tr key={entry.ticker} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => selectTicker(entry.ticker)}
                              className="font-bold text-white text-left hover:text-[#10b981] transition-colors cursor-pointer"
                            >
                              {entry.ticker.replace('_NSE', '')}
                            </button>
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{entry.company}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: 'rgba(129,140,248,0.12)', color: T.purple }}>
                            {entry.quarter}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                            <span style={{ color: 'var(--text-secondary)' }}>{formatDate(entry.date)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                            <span className="capitalize" style={{ color: 'var(--text-muted)' }}>
                              {entry.timeOfDay?.replace('-', ' ') || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className="font-bold tabular-nums text-[11px]"
                            style={{ color: isImminent ? T.amber : 'var(--text-secondary)' }}
                          >
                            {days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'recent' && (
            <div className="py-16 flex flex-col items-center gap-3 text-center px-5">
              <TrendingUp className="w-8 h-8" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                Recent results not available
              </p>
              <p className="text-xs font-mono max-w-sm" style={{ color: 'var(--text-muted)' }}>
                Connect a live earnings API to populate Q1/Q2 FY27 results, EPS actuals vs estimates, and beat/miss indicators.
              </p>
              <Link
                href="/screener"
                className="flex items-center gap-1.5 text-xs font-mono transition-colors mt-2"
                style={{ color: T.purple }}
              >
                View stock fundamentals in screener <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        <DataDisclaimer note="Earnings dates are indicative estimates. Always verify with the official NSE or company investor relations website before making decisions." />
      </main>
    </div>
  );
}
