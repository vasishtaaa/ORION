'use client';

import React, { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { clsx } from 'clsx';

interface OptionsChainViewProps {
  currentPrice: number;
  activeTicker: string;
}

export function OptionsChainView({ currentPrice, activeTicker }: OptionsChainViewProps) {
  const [expiry, setExpiry] = useState<'current_week' | 'monthly'>('current_week');

  const basePrice = currentPrice > 0 ? currentPrice : 2400;
  // Determine realistic strike step size based on instrument price
  const strikeStep = basePrice > 10000 ? 100 : basePrice > 2000 ? 50 : basePrice > 500 ? 20 : 10;
  const atmStrike = Math.round(basePrice / strikeStep) * strikeStep;

  // Generate 11 strikes around ATM (-5 to +5)
  const optionRows = useMemo(() => {
    const rows = [];
    for (let i = -6; i <= 6; i++) {
      const strike = atmStrike + i * strikeStep;
      const isAtm = strike === atmStrike;

      // Simulated realistic Black-Scholes approximations based on distance to ATM
      const dist = (strike - basePrice) / basePrice;
      const callLtp = Math.max(1.5, Math.round((Math.max(0, basePrice - strike) + basePrice * 0.025 * Math.exp(-Math.pow(dist * 6, 2))) * 10) / 10);
      const putLtp = Math.max(1.5, Math.round((Math.max(0, strike - basePrice) + basePrice * 0.025 * Math.exp(-Math.pow(dist * 6, 2))) * 10) / 10);

      // Open interest distribution
      const callOi = Math.round(15000 * Math.exp(-Math.pow((strike - atmStrike * 1.02) / (strikeStep * 4), 2)) + 3000 + (Math.sin(strike) * 2000));
      const putOi = Math.round(18000 * Math.exp(-Math.pow((strike - atmStrike * 0.98) / (strikeStep * 4), 2)) + 3500 + (Math.cos(strike) * 2000));

      const callOiChg = Math.round((callOi * 0.12) * (dist > 0 ? 1 : -0.5));
      const putOiChg = Math.round((putOi * 0.14) * (dist < 0 ? 1 : -0.4));

      rows.push({
        strike,
        isAtm,
        callLtp,
        callOi,
        callOiChg,
        callIv: (18.5 + Math.abs(dist) * 20).toFixed(1),
        putLtp,
        putOi,
        putOiChg,
        putIv: (19.2 + Math.abs(dist) * 22).toFixed(1),
      });
    }
    return rows;
  }, [atmStrike, basePrice, strikeStep]);

  // Aggregate Metrics
  const totalCallOi = useMemo(() => optionRows.reduce((a, b) => a + b.callOi, 0), [optionRows]);
  const totalPutOi = useMemo(() => optionRows.reduce((a, b) => a + b.putOi, 0), [optionRows]);
  const pcr = totalCallOi > 0 ? (totalPutOi / totalCallOi).toFixed(2) : '1.00';
  const pcrNum = parseFloat(pcr);

  // Max Pain Calculation: Strike where total payout to option buyers is minimized
  const maxPainStrike = useMemo(() => {
    let minLoss = Infinity;
    let bestStrike = atmStrike;

    optionRows.forEach((candidate) => {
      let loss = 0;
      optionRows.forEach((row) => {
        // Call buyer payout if price ends at candidate.strike
        if (candidate.strike > row.strike) {
          loss += (candidate.strike - row.strike) * row.callOi;
        }
        // Put buyer payout if price ends at candidate.strike
        if (candidate.strike < row.strike) {
          loss += (row.strike - candidate.strike) * row.putOi;
        }
      });
      if (loss < minLoss) {
        minLoss = loss;
        bestStrike = candidate.strike;
      }
    });
    return bestStrike;
  }, [atmStrike, optionRows]);

  const maxCallOi = Math.max(...optionRows.map((r) => r.callOi));
  const maxPutOi = Math.max(...optionRows.map((r) => r.putOi));

  return (
    <div className="w-full flex flex-col gap-3 font-mono text-xs">
      {/* Header and KPI Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-white uppercase tracking-wider">
            NSE Derivative Chain — {activeTicker.split('_')[0]}
          </h4>
          <span className="text-slate-400">Spot ₹{basePrice.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">PCR:</span>
            <span
              className={clsx(
                'px-2 py-0.5 rounded font-bold text-xs',
                pcrNum >= 1.2
                  ? 'bg-emerald-950 text-emerald-400'
                  : pcrNum <= 0.8
                  ? 'bg-rose-950 text-rose-400'
                  : 'bg-yellow-950 text-yellow-400'
              )}
            >
              {pcr} {pcrNum >= 1.0 ? 'Bullish Bias' : 'Bearish Bias'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">MAX PAIN:</span>
            <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded text-xs">
              ₹{maxPainStrike}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded-lg text-[10px]">
            <button
              onClick={() => setExpiry('current_week')}
              className={clsx(
                'px-2 py-0.5 rounded cursor-pointer transition-colors',
                expiry === 'current_week' ? 'bg-[#50C878] text-black font-bold' : 'text-slate-400 hover:text-white'
              )}
            >
              Weekly Expiry
            </button>
            <button
              onClick={() => setExpiry('monthly')}
              className={clsx(
                'px-2 py-0.5 rounded cursor-pointer transition-colors',
                expiry === 'monthly' ? 'bg-[#50C878] text-black font-bold' : 'text-slate-400 hover:text-white'
              )}
            >
              Monthly Expiry
            </button>
          </div>
        </div>
      </div>

      {/* Options Chain Ladder Table */}
      <div className="overflow-x-auto w-full max-h-[360px] overflow-y-auto border border-white/10 rounded-xl">
        <table className="w-full text-center text-[11px] border-collapse">
          <thead className="sticky top-0 bg-[#0e131d] z-10 border-b border-white/15 text-[10px] uppercase">
            <tr className="text-slate-400">
              <th colSpan={4} className="py-2 text-cyan-400 bg-cyan-950/20 border-r border-white/10">
                CALL OPTIONS (CE)
              </th>
              <th className="py-2 px-3 text-white bg-white/5 border-r border-white/10">STRIKE</th>
              <th colSpan={4} className="py-2 text-purple-400 bg-purple-950/20">
                PUT OPTIONS (PE)
              </th>
            </tr>
            <tr className="border-t border-white/10 text-slate-500">
              <th className="py-1.5 px-2 text-left">OI</th>
              <th className="py-1.5 px-2">Chg OI</th>
              <th className="py-1.5 px-2">IV%</th>
              <th className="py-1.5 px-2 text-right border-r border-white/10">LTP</th>
              <th className="py-1.5 px-3 bg-white/5 text-white font-bold border-r border-white/10">PRICE</th>
              <th className="py-1.5 px-2 text-left">LTP</th>
              <th className="py-1.5 px-2">IV%</th>
              <th className="py-1.5 px-2">Chg OI</th>
              <th className="py-1.5 px-2 text-right">OI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {optionRows.map((row) => (
              <tr
                key={row.strike}
                className={clsx(
                  'hover:bg-white/[0.04] transition-colors',
                  row.isAtm ? 'bg-amber-400/10 font-semibold' : ''
                )}
              >
                {/* CALLS */}
                <td className="py-1.5 px-2 text-left text-slate-300 relative">
                  <div
                    className="absolute left-0 top-1 bottom-1 bg-cyan-500/10 -z-0"
                    style={{ width: `${(row.callOi / maxCallOi) * 100}%` }}
                  />
                  <span className="relative z-10">{row.callOi.toLocaleString()}</span>
                </td>
                <td className={clsx('py-1.5 px-2', row.callOiChg >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {row.callOiChg >= 0 ? '+' : ''}
                  {row.callOiChg}
                </td>
                <td className="py-1.5 px-2 text-slate-400">{row.callIv}</td>
                <td className="py-1.5 px-2 text-right font-bold text-cyan-300 border-r border-white/10">
                  ₹{row.callLtp.toFixed(1)}
                </td>

                {/* STRIKE */}
                <td
                  className={clsx(
                    'py-1.5 px-3 font-bold border-r border-white/10',
                    row.isAtm ? 'text-amber-300 bg-amber-400/20' : 'text-white bg-white/5'
                  )}
                >
                  ₹{row.strike} {row.isAtm ? '• ATM' : ''}
                </td>

                {/* PUTS */}
                <td className="py-1.5 px-2 text-left font-bold text-purple-300">
                  ₹{row.putLtp.toFixed(1)}
                </td>
                <td className="py-1.5 px-2 text-slate-400">{row.putIv}</td>
                <td className={clsx('py-1.5 px-2', row.putOiChg >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {row.putOiChg >= 0 ? '+' : ''}
                  {row.putOiChg}
                </td>
                <td className="py-1.5 px-2 text-right text-slate-300 relative">
                  <div
                    className="absolute right-0 top-1 bottom-1 bg-purple-500/10 -z-0"
                    style={{ width: `${(row.putOi / maxPutOi) * 100}%` }}
                  />
                  <span className="relative z-10">{row.putOi.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
