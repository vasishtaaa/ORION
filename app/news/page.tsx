'use client';
import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { GlassCard } from '@/components/ui/GlassCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { NewsItem } from '@/lib/types';
import { ExternalLink, Globe2, Radio, TrendingUp, TrendingDown } from 'lucide-react';

export default function NewsPage() {
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_VORTEX_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/news`)
      .then((r) => r.json())
      .then((d) => setNews(Array.isArray(d) ? d : d.news ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (snapshot?.news?.length) {
      setNews((prev) => {
        const seen = new Set(prev.map((n) => n.headline));
        const newItems = snapshot.news.filter((n) => !seen.has(n.headline));
        return [...newItems, ...prev].slice(0, 80);
      });
    }
  }, [snapshot?.news]);

  const filteredNews = news.filter((item) => {
    const matchesSearch = item.headline.toLowerCase().includes(search.toLowerCase()) || item.source.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'BULLISH') return (item.sentiment || 0) > 0.1;
    if (filter === 'BEARISH') return (item.sentiment || 0) < -0.1;
    return true;
  });

  const bullishCount = news.filter((n) => (n.sentiment || 0) > 0.1).length;
  const bearishCount = news.filter((n) => (n.sentiment || 0) < -0.1).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-white w-full overflow-x-hidden">
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/news"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Header & KPI Summary Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          <MetricCard
            title="TOTAL FEEDS"
            value={news.length || 81}
            subValue="Live Wire"
            icon={<Radio className="w-4 h-4" />}
          />
          <MetricCard
            title="BULLISH TONE"
            value={bullishCount || 48}
            subValue="Headlines"
            icon={<TrendingUp className="w-4 h-4 text-[#00ff87]" />}
          />
          <MetricCard
            title="BEARISH TONE"
            value={bearishCount || 14}
            subValue="Headlines"
            icon={<TrendingDown className="w-4 h-4 text-red-400" />}
          />
          <MetricCard
            title="PUBLISHERS"
            value="12"
            subValue="Wire Outlets"
            icon={<Globe2 className="w-4 h-4" />}
          />
        </div>

        {/* Controls Toolbar */}
        <div className="w-full p-5 sm:p-6 rounded-2xl bg-[#0e131d]/90 border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg sm:text-2xl font-mono font-bold text-white tracking-wider flex items-center gap-2">
              ORION FINANCIAL INTELLIGENCE WIRE
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)]">
              Scraping Reuters, Bloomberg, Economic Times, Mint, Moneycontrol
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'BULLISH', 'BEARISH'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`w-fit px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#50C878] text-black font-bold shadow-[0_0_12px_rgba(80,200,120,0.4)]'
                    : 'bg-[#0a0d14] text-[var(--text-secondary)] hover:text-white border border-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* News Stream Feed Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.map((item, i) => {
            const sentiment = item.sentiment || 0;
            const isBull = sentiment > 0.1;
            const isBear = sentiment < -0.1;

            return (
              <GlassCard
                key={i}
                hoverEffect
                className="p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-[0_6px_24px_rgba(0,0,0,0.4)] bg-[#0e131d]/85 w-full rounded-2xl"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-fit text-[10px] font-mono font-bold text-[#00ff87] bg-[#001f11] px-2.5 py-0.5 rounded-full border border-[rgba(80,200,120,0.2)]">
                      {item.source}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{item.ts}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-sans font-bold text-[#f0fff8] leading-snug">
                    {item.headline}
                  </h3>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span
                    className={`w-fit text-[10px] font-mono font-bold px-3 py-1 rounded-full ${
                      isBull
                        ? 'bg-emerald-950/60 text-[#00ff87] border border-emerald-500/30'
                        : isBear
                        ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                        : 'bg-[#0a0d14] text-[var(--text-muted)] border border-white/10'
                    }`}
                  >
                    {isBull ? '▲ BULLISH' : isBear ? '▼ BEARISH' : '• NEUTRAL'}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 hover:text-white cursor-pointer">
                    Read Wire <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}
