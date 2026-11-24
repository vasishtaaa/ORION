'use client';

import React from 'react';
import { Landmark, ArrowUpRight, Layers, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface BlockDeal {
  id: string;
  time: string;
  ticker: string;
  shares: number;
  price: number;
  valueCr: number;
  side: 'BUY' | 'SELL';
  venue: 'NSE Block Window' | 'NSE Regular';
}

const RECENT_BLOCK_DEALS: BlockDeal[] = [
  { id: 'bd-1', time: '14:28:10', ticker: 'RELIANCE', shares: 450000, price: 1284.50, valueCr: 57.80, side: 'BUY', venue: 'NSE Block Window' },
  { id: 'bd-2', time: '14:15:44', ticker: 'HDFCBANK', shares: 620000, price: 1742.00, valueCr: 108.00, side: 'BUY', venue: 'NSE Block Window' },
  { id: 'bd-3', time: '13:52:19', ticker: 'TCS', shares: 180000, price: 3495.20, valueCr: 62.91, side: 'SELL', venue: 'NSE Regular' },
  { id: 'bd-4', time: '13:30:05', ticker: 'INFY', shares: 350000, price: 1845.00, valueCr: 64.57, side: 'BUY', venue: 'NSE Block Window' },
  { id: 'bd-5', time: '12:45:12', ticker: 'ICICIBANK', shares: 500000, price: 1260.10, valueCr: 63.00, side: 'BUY', venue: 'NSE Regular' },
];

export function InstitutionalFlowTracker() {
  const fiiCashNet = +1428.5; // ₹ Cr
  const diiCashNet = +2185.0; // ₹ Cr
  const totalNet = fiiCashNet + diiCashNet;
  const fiiLongRatio = 58.4; // %

  return (
    <div className="w-full flex flex-col gap-4 font-mono text-xs">
      {/* Institutional Capital KPI Cards */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-white uppercase tracking-wider">
            Institutional FII / DII Flow Telemetry
          </h4>
        </div>
        <span className="text-[10px] text-slate-500">Source: NSE Daily Capital Aggregator</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* FII Net */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">FII Cash Net (Daily)</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              +₹{fiiCashNet.toLocaleString()} Cr
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Institutional Foreign Buying</span>
        </div>

        {/* DII Net */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">DII Cash Net (Daily)</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              +₹{diiCashNet.toLocaleString()} Cr
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Domestic Mutual Funds / SIP</span>
        </div>

        {/* Combined Net */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">Total Institutional Net</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-cyan-300 tabular-nums">
              +₹{totalNet.toLocaleString()} Cr
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[10px] text-emerald-400">Net Liquidity Influx</span>
        </div>

        {/* FII Derivative Long Ratio */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">FII Index Futures Long</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tabular-nums">
              {fiiLongRatio}%
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-semibold">
              BULL BIAS
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
            <div className="h-full bg-emerald-500" style={{ width: `${fiiLongRatio}%` }} />
          </div>
        </div>
      </div>

      {/* Block Deals Scanner Table */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#50C878]" />
            <h4 className="font-bold text-white uppercase tracking-wider">
              Whale Order & Institutional Block Deal Prints
            </h4>
          </div>
          <span className="text-[10px] text-slate-500">Orders &gt; ₹50 Cr</span>
        </div>

        <div className="overflow-x-auto w-full border border-white/10 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e131d] border-b border-white/15 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-2">Side</th>
                <th className="py-2.5 px-3 text-right">Shares</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Value (₹ Cr)</th>
                <th className="py-2.5 px-3 text-center">Execution Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RECENT_BLOCK_DEALS.map((deal) => (
                <tr key={deal.id} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-slate-500 text-[10px]">{deal.time}</td>
                  <td className="py-2 px-3 font-bold text-white">{deal.ticker}</td>
                  <td className="py-2 px-2">
                    <span
                      className={clsx(
                        'px-1.5 py-0.5 rounded text-[10px] font-bold',
                        deal.side === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      )}
                    >
                      {deal.side}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200">{deal.shares.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-slate-300">₹{deal.price.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-bold text-white">₹{deal.valueCr.toFixed(2)} Cr</td>
                  <td className="py-2 px-3 text-center text-slate-400 text-[10px]">{deal.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
