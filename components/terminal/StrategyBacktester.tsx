'use client';

import React, { useState, useMemo } from 'react';
import { Candle } from '@/lib/types';
import { runBacktest, StrategyType, BacktestResult } from '@/lib/backtester';
import { BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';

interface StrategyBacktesterProps {
  candles: Candle[];
  activeTicker: string;
}

export function StrategyBacktester({ candles, activeTicker }: StrategyBacktesterProps) {
  const [strategy, setStrategy] = useState<StrategyType>('rsi_reversal');
  const [capital, setCapital] = useState<number>(500000);
  const [riskPct, setRiskPct] = useState<number>(2.0);

  const result: BacktestResult = useMemo(() => {
    return runBacktest(candles, strategy, capital, riskPct / 100);
  }, [candles, strategy, capital, riskPct]);

  const cleanTicker = activeTicker.split('_')[0];

  // Generate SVG path for equity curve
  const equityPoints = result.equityCurve;
  const svgWidth = 600;
  const svgHeight = 120;
  const minEquity = Math.min(...equityPoints.map((p) => p.equity)) * 0.995;
  const maxEquity = Math.max(...equityPoints.map((p) => p.equity)) * 1.005;
  const eqRange = maxEquity - minEquity || 1;

  const pointsString = equityPoints
    .map((p, idx) => {
      const x = (idx / (equityPoints.length - 1 || 1)) * svgWidth;
      const y = svgHeight - ((p.equity - minEquity) / eqRange) * svgHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="w-full flex flex-col gap-4 font-mono text-xs">
      {/* Strategy Selector & Parameters Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#50C878]" />
          <h4 className="font-bold text-white uppercase tracking-wider">
            Quant Strategy Backtester — {cleanTicker}
          </h4>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as StrategyType)}
            className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#50C878] cursor-pointer"
          >
            <option value="rsi_reversal">RSI Mean Reversion (14/35/70)</option>
            <option value="ema_crossover">Golden Cross (EMA 20/50)</option>
            <option value="vwap_breakout">VWAP Intraday Momentum</option>
            <option value="bollinger_bounce">Bollinger Band Squeeze</option>
          </select>

          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-xl">
            <span className="text-[10px] text-slate-500">Capital:</span>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-20 bg-transparent text-white font-mono text-xs focus:outline-none text-right"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-xl">
            <span className="text-[10px] text-slate-500">Risk%:</span>
            <input
              type="number"
              step="0.5"
              value={riskPct}
              onChange={(e) => setRiskPct(Number(e.target.value))}
              className="w-12 bg-transparent text-white font-mono text-xs focus:outline-none text-right"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">Net Return</span>
          <span
            className={clsx(
              'text-lg font-bold tabular-nums',
              result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            )}
          >
            {result.netProfit >= 0 ? '+' : ''}₹{result.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400">
            {result.totalReturnPct >= 0 ? '+' : ''}
            {result.totalReturnPct.toFixed(2)}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">Win Rate</span>
          <span className="text-lg font-bold text-white tabular-nums">
            {result.winRate.toFixed(1)}%
          </span>
          <span className="text-[10px] text-emerald-400">
            {result.winTrades} W / {result.lossTrades} L
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">Profit Factor</span>
          <span
            className={clsx(
              'text-lg font-bold tabular-nums',
              result.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-amber-400'
            )}
          >
            {result.profitFactor}x
          </span>
          <span className="text-[10px] text-slate-400">Gross P/L Ratio</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">Max Drawdown</span>
          <span className="text-lg font-bold text-rose-400 tabular-nums">
            -{result.maxDrawdownPct.toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-400">Peak-to-Trough</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 uppercase">Total Trades</span>
          <span className="text-lg font-bold text-cyan-300 tabular-nums">
            {result.totalTrades}
          </span>
          <span className="text-[10px] text-slate-400">Signals Executed</span>
        </div>
      </div>

      {/* Equity Curve SVG */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase">
          <span>Cumulative Equity Curve</span>
          <span>Final: ₹{result.finalCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="w-full h-28 relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={result.netProfit >= 0 ? '#10b981' : '#f43f5e'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          </svg>
        </div>
      </div>

      {/* Trade Ledger Table */}
      <div className="overflow-x-auto w-full max-h-56 overflow-y-auto border border-white/10 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#0e131d] z-10 border-b border-white/15 text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="py-2 px-3">Trade #</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2 text-right">Shares</th>
              <th className="py-2 px-2 text-right">Entry</th>
              <th className="py-2 px-2 text-right">Exit</th>
              <th className="py-2 px-2 text-right">PnL (₹)</th>
              <th className="py-2 px-2 text-right">Return %</th>
              <th className="py-2 px-3 text-center">Exit Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {result.trades.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No signals triggered for this strategy in the current candle sample.
                </td>
              </tr>
            ) : (
              result.trades.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-slate-400 font-bold">{t.id}</td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400">
                      {t.side}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">{t.shares}</td>
                  <td className="py-2 px-2 text-right text-slate-300">₹{t.entryPrice.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right text-white">₹{t.exitPrice.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">
                    <span className={clsx('font-bold', t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                      {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className={clsx('font-bold', t.pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                      {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={clsx(
                        'px-1.5 py-0.5 rounded text-[9px] font-semibold',
                        t.exitReason === 'TARGET'
                          ? 'bg-emerald-950/80 text-emerald-400'
                          : t.exitReason === 'STOP_LOSS'
                          ? 'bg-rose-950/80 text-rose-400'
                          : 'bg-white/10 text-slate-300'
                      )}
                    >
                      {t.exitReason}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
