'use client';
import React from 'react';

const STATS = [
  { value: '< 640 µs', label: 'p50 Processing Latency', sub: 'Sub-millisecond packet cycle' },
  { value: '10,000+', label: 'Packets / Second', sub: 'High-throughput stream pipeline' },
  { value: '99.99%', label: 'Telemetric Stream Uptime', sub: 'High availability clustering' },
  { value: '88.4%', label: 'Model Confidence Score', sub: 'Gemini quantitative consensus' },
];

export function StatsBar() {
  return (
    <section className="w-full py-16 sm:py-20 border-y border-white/10 bg-[#06090e]/80 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {STATS.map((s, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 text-center md:text-left min-w-0">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-[#00ff87] tracking-tight">
                {s.value}
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
                {s.label}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] truncate">
                {s.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
