'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useVortexSocket } from '@/lib/websocket';
import { NewsItem } from '@/lib/types';

const AppHeader = dynamic(() => import('@/components/layout/AppHeader'), { ssr: false });

const CATEGORIES = ['ALL', 'MARKET', 'ECONOMY', 'TECH', 'BANKING', 'ENERGY'];

function SentimentBar({ score }: { score: number }) {
  const pct = (score + 1) / 2 * 100;
  const col = score > 0.2 ? '#10b981' : score < -0.2 ? '#ef4444' : '#eab308';
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: col }} />
      </div>
      <span className="font-mono text-[10px] font-bold" style={{ color: col }}>
        {score > 0 ? '+' : ''}{(score * 100).toFixed(0)}
      </span>
    </div>
  );
}

export default function NewsPage() {
  const { status, snapshot, activeTicker } = useVortexSocket();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('http://localhost:8000/api/news')
      .then(r => r.json())
      .then(d => setNews(Array.isArray(d) ? d : d.news ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (snapshot?.news?.length) setNews(prev => {
      const seen = new Set(prev.map(n => n.headline));
      const newItems = snapshot.news.filter(n => !seen.has(n.headline));
      return [...newItems, ...prev].slice(0, 80);
    });
  }, [snapshot?.news]);

  const filtered = filter === 'ALL' ? news : news.filter(n => n.source?.toUpperCase().includes(filter) || n.headline?.toUpperCase().includes(filter));

  const getSentimentLabel = (score?: number) => {
    if (score === undefined) return { label: 'NEUTRAL', color: '#eab308' };
    if (score > 0.3) return { label: 'BULLISH', color: '#10b981' };
    if (score < -0.3) return { label: 'BEARISH', color: '#ef4444' };
    return { label: 'NEUTRAL', color: '#eab308' };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden gap-6">
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/news" />

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden h-full flex flex-col min-h-[500px]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid rgba(80,200,120,0.15)' }}>
            <div>
              <h2 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">MARKET NEWS HUB</h2>
              <p className="font-mono text-xs font-semibold mt-1 text-[var(--text-muted)]">{news.length} HEADLINES · LIVE RSS WIRE</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className="font-mono text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                  style={filter === c ? {
                    background: 'rgba(80,200,120,0.2)',
                    border: '1px solid rgba(80,200,120,0.45)',
                    color: 'var(--matrix)',
                  } : {
                    color: 'var(--text-muted)',
                    border: '1px solid rgba(80,200,120,0.15)',
                    background: 'transparent'
                  }}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* News Grid */}
          <div className="flex-1 overflow-y-auto pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filtered.map((item, i) => {
                  const sent = getSentimentLabel(item.sentiment);
                  return (
                    <motion.div
                      key={`${item.headline}-${i}`}
                      className="glass-sm rounded-xl overflow-hidden cursor-pointer flex flex-col gap-3"
                      style={{ padding: '18px 22px' }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.5) }}
                      whileHover={{ scale: 1.015 }}
                      onClick={() => item.url && window.open(item.url, '_blank')}
                    >
                      {/* Source + Sentiment */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-2 py-1 rounded bg-[rgba(0,66,37,0.6)] text-[var(--matrix)] border border-[rgba(80,200,120,0.2)]">
                          {item.source?.toUpperCase() ?? 'WIRE'}
                        </span>
                        <span className="font-mono text-[10px] font-bold" style={{ color: sent.color }}>
                          {sent.label}
                        </span>
                      </div>

                      {/* Headline */}
                      <p className="font-mono text-xs font-semibold leading-relaxed flex-1 text-[var(--text-primary)]">
                        {item.headline}
                      </p>

                      {/* Sentiment bar + timestamp */}
                      <div>
                        {item.sentiment !== undefined && <SentimentBar score={item.sentiment} />}
                        {item.ts && (
                          <p className="font-mono text-[10px] font-semibold mt-1.5 text-[var(--text-muted)]">
                            {new Date(item.ts * 1000).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="col-span-3 flex items-center justify-center py-16 font-mono text-xs font-semibold text-[var(--text-muted)]">
                  Fetching market intelligence wire...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
