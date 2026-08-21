'use client';
import React from 'react';

const TICKERS = [
  { symbol: 'NIFTY 50', price: '24,850.15', change: '+0.45%', up: true },
  { symbol: 'SENSEX', price: '81,320.60', change: '+0.38%', up: true },
  { symbol: 'TCS', price: '₹3,952.11', change: '+1.05%', up: true },
  { symbol: 'HDFC BANK', price: '₹1,653.80', change: '+0.74%', up: true },
  { symbol: 'RELIANCE', price: '₹2,980.50', change: '+1.20%', up: true },
  { symbol: 'INFOSYS', price: '₹1,788.40', change: '+0.88%', up: true },
  { symbol: 'ICICI BANK', price: '₹1,198.20', change: '+0.62%', up: true },
  { symbol: 'SBIN', price: '₹815.30', change: '+1.12%', up: true },
  { symbol: 'TATA MOTORS', price: '₹972.40', change: '+1.45%', up: true },
  { symbol: 'ADANI ENT', price: '₹3,145.00', change: '+2.10%', up: true },
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
