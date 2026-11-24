'use client';

import React from 'react';
import { Grid, Compass } from 'lucide-react';
import { clsx } from 'clsx';

const ASSETS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'TATAMOTORS', 'ADANIENT'];

// Realistic correlation matrix based on long-term historical beta & returns
const CORRELATION_MATRIX: Record<string, Record<string, number>> = {
  RELIANCE:   { RELIANCE: 1.00, TCS: 0.38, HDFCBANK: 0.54, INFY: 0.35, ICICIBANK: 0.58, SBIN: 0.52, TATAMOTORS: 0.44, ADANIENT: 0.49 },
  TCS:        { RELIANCE: 0.38, TCS: 1.00, HDFCBANK: 0.31, INFY: 0.88, ICICIBANK: 0.34, SBIN: 0.28, TATAMOTORS: 0.32, ADANIENT: 0.21 },
  HDFCBANK:   { RELIANCE: 0.54, TCS: 0.31, HDFCBANK: 1.00, INFY: 0.30, ICICIBANK: 0.82, SBIN: 0.74, TATAMOTORS: 0.46, ADANIENT: 0.38 },
  INFY:       { RELIANCE: 0.35, TCS: 0.88, HDFCBANK: 0.30, INFY: 1.00, ICICIBANK: 0.31, SBIN: 0.24, TATAMOTORS: 0.29, ADANIENT: 0.19 },
  ICICIBANK:  { RELIANCE: 0.58, TCS: 0.34, HDFCBANK: 0.82, INFY: 0.31, ICICIBANK: 1.00, SBIN: 0.79, TATAMOTORS: 0.51, ADANIENT: 0.42 },
  SBIN:       { RELIANCE: 0.52, TCS: 0.28, HDFCBANK: 0.74, INFY: 0.24, ICICIBANK: 0.79, SBIN: 1.00, TATAMOTORS: 0.55, ADANIENT: 0.48 },
  TATAMOTORS: { RELIANCE: 0.44, TCS: 0.32, HDFCBANK: 0.46, INFY: 0.29, ICICIBANK: 0.51, SBIN: 0.55, TATAMOTORS: 1.00, ADANIENT: 0.45 },
  ADANIENT:   { RELIANCE: 0.49, TCS: 0.21, HDFCBANK: 0.38, INFY: 0.19, ICICIBANK: 0.42, SBIN: 0.48, TATAMOTORS: 0.45, ADANIENT: 1.00 },
};

const SECTORS = [
  { name: 'NIFTY AUTO', chg: +2.14, momentum: 'Leading', score: 86, color: 'text-emerald-400' },
  { name: 'NIFTY BANK', chg: +1.45, momentum: 'Leading', score: 82, color: 'text-emerald-400' },
  { name: 'NIFTY IT', chg: +0.68, momentum: 'Improving', score: 64, color: 'text-cyan-400' },
  { name: 'NIFTY ENERGY', chg: -0.32, momentum: 'Weakening', score: 48, color: 'text-amber-400' },
  { name: 'NIFTY PHARMA', chg: -0.84, momentum: 'Lagging', score: 36, color: 'text-rose-400' },
  { name: 'NIFTY METAL', chg: -1.25, momentum: 'Lagging', score: 29, color: 'text-rose-400' },
];

function getCorrColor(val: number): string {
  if (val === 1.0) return 'bg-[#50C878]/30 text-[#00ff87] font-bold';
  if (val >= 0.75) return 'bg-emerald-950/70 text-emerald-300 font-semibold';
  if (val >= 0.5) return 'bg-cyan-950/60 text-cyan-300';
  if (val >= 0.3) return 'bg-sky-950/40 text-sky-200';
  return 'bg-white/[0.03] text-slate-400';
}

export function CorrelationMatrix() {
  return (
    <div className="w-full flex flex-col gap-5 font-mono text-xs">
      {/* Sector Relative Strength Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-white uppercase tracking-wider">Sector Rotation & Relative Strength</h4>
          </div>
          <span className="text-[10px] text-slate-500">Benchmark: NIFTY 50</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SECTORS.map((s) => (
            <div
              key={s.name}
              className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1"
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-300 font-bold">{s.name}</span>
                <span className={clsx('font-bold', s.chg >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {s.chg >= 0 ? '+' : ''}{s.chg}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                <span className="text-[9px] uppercase">{s.momentum}</span>
                <span className="text-white font-bold">{s.score}/100</span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={clsx('h-full', s.score >= 70 ? 'bg-emerald-500' : s.score >= 50 ? 'bg-cyan-500' : 'bg-rose-500')}
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Asset Correlation Heatmap Table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#50C878]" />
            <h4 className="font-bold text-white uppercase tracking-wider">NIFTY Heavyweights Correlation Matrix</h4>
          </div>
          <span className="text-[10px] text-slate-500">Rolling 60-Day Pearson r</span>
        </div>

        <div className="overflow-x-auto w-full border border-white/10 rounded-xl">
          <table className="w-full text-center text-[11px] border-collapse">
            <thead className="bg-[#0e131d] border-b border-white/15 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3 text-left font-bold text-white">ASSET</th>
                {ASSETS.map((a) => (
                  <th key={a} className="py-2.5 px-2 font-mono">
                    {a.length > 6 ? a.slice(0, 6) : a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ASSETS.map((rowAsset) => (
                <tr key={rowAsset} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-left font-bold text-white border-r border-white/10">
                    {rowAsset}
                  </td>
                  {ASSETS.map((colAsset) => {
                    const val = CORRELATION_MATRIX[rowAsset]?.[colAsset] ?? 0;
                    return (
                      <td key={colAsset} className="py-2 px-1">
                        <div
                          className={clsx(
                            'py-1 rounded text-[10px] font-mono tabular-nums transition-colors',
                            getCorrColor(val)
                          )}
                        >
                          {val.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
