'use client';
import React from 'react';

const TICKERS = [
  { symbol: 'NIFTY 50', price: '24,850.15', change: '+0.45%', up: true },
  { symbol: 'SENSEX', price: '81,320.60', change: '+0.38%', up: true },
  { symbol: 'TCS', price: '₹2,253.60', change: '-0.72%', up: false },
  { symbol: 'RELIANCE', price: '₹1,288.50', change: '-0.73%', up: false },
  { symbol: 'HDFC BANK', price: '₹711.00', change: '-2.23%', up: false },
  { symbol: 'INFOSYS', price: '₹1,110.80', change: '-0.82%', up: false },
  { symbol: 'ICICI BANK', price: '₹1,443.00', change: '+0.91%', up: true },
  { symbol: 'SBIN', price: '₹1,042.90', change: '-0.86%', up: false },
  { symbol: 'BHARTI AIRTEL', price: '₹1,878.30', change: '-1.25%', up: false },
  { symbol: 'L&T', price: '₹4,027.00', change: '-0.27%', up: false },
  { symbol: 'MARUTI', price: '₹13,440.00', change: '-0.59%', up: false },
  { symbol: 'TITAN', price: '₹5,139.30', change: '+0.77%', up: true },
];

export function MarketRibbon() {
  return (
    <div className="w-full overflow-hidden py-3 border-y border-white/10 bg-[#06090e]/90 backdrop-blur-md relative select-none">
      {/* Gradient masks for smooth fade at edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0a0d14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0a0d14] to-transparent z-10 pointer-events-none" />

      <div className="flex gap-8 whitespace-nowrap animate-marquee">
        {[...TICKERS, ...TICKERS].map((t, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[var(--text-secondary)] font-semibold">{t.symbol}:</span>
            <span className="text-white font-bold">{t.price}</span>
            <span className={t.up ? 'text-[#00ff87] font-semibold' : 'text-red-400 font-semibold'}>
              ({t.change})
            </span>
            <span className="text-white/20 mx-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
