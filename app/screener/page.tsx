'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { GlassCard } from '@/components/ui/GlassCard';
import { SignalBadge, ChangeBadge } from '@/components/ui/Badges';
import { Button } from '@/components/ui/Button';
import { exportScreenerToCSV } from '@/lib/export';
import { useToast } from '@/components/ui/Toast';
import { Search, Download, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { ScreenerItem } from '@/lib/types';

export default function ScreenerPage() {
  const router = useRouter();
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();
  const { success } = useToast();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL' | 'OVERSOLD' | 'OVERBOUGHT'>('ALL');
  const [sortField, setSortField] = useState<keyof ScreenerItem>('quant_score');
  const [sortAsc, setSortAsc] = useState(false);

  const rawItems = snapshot?.screener || [];

  const filteredItems = useMemo(() => {
    return rawItems
      .filter((item) => {
        const matchesSearch =
          item.ticker.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        const sig = item.recommendation || item.signal || 'HOLD';
        if (filterType === 'BUY') return sig === 'BUY';
        if (filterType === 'SELL') return sig === 'SELL';
        if (filterType === 'OVERSOLD') return item.rsi <= 40;
        if (filterType === 'OVERBOUGHT') return item.rsi >= 60;
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });
  }, [rawItems, search, filterType, sortField, sortAsc]);

  const handleSort = (field: keyof ScreenerItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExport = () => {
    exportScreenerToCSV(filteredItems);
    success(`Exported ${filteredItems.length} screener equities to CSV`);
  };

  return (
    <div className="min-h-screen relative flex flex-col gap-6 w-full" style={{ background: '#000e07' }}>
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/screener"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-6 pb-16">
        {/* Header & Controls Toolbar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#001008]/90 border border-[rgba(80,200,120,0.18)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-mono font-bold text-white tracking-wider flex items-center gap-2">
              REAL-TIME MARKET SCREENER
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00ff87]/20 text-[#00ff87] font-bold">
                {filteredItems.length} EQUITIES
              </span>
            </h1>
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              Multi-factor quantitative technical ranking across NSE / BSE bluechips
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter stocks..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#00140a] border border-[rgba(80,200,120,0.2)] text-xs font-mono text-white focus:outline-none focus:border-[#00ff87]"
              />
            </div>

            {/* CSV Export Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filter Presets Pill Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-[var(--matrix)] flex-shrink-0" />
          {[
            { label: 'All Equities', val: 'ALL' },
            { label: '🟢 Buy Signals', val: 'BUY' },
            { label: '🔴 Sell Signals', val: 'SELL' },
            { label: '⚡ Oversold (RSI < 40)', val: 'OVERSOLD' },
            { label: '🔥 Overbought (RSI > 60)', val: 'OVERBOUGHT' },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilterType(f.val as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === f.val
                  ? 'bg-[#50C878] text-black font-bold shadow-[0_0_12px_rgba(80,200,120,0.4)]'
                  : 'bg-[#00140a] text-[var(--text-secondary)] hover:text-white border border-[rgba(80,200,120,0.15)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Screener Data Table */}
        <GlassCard className="p-0 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#00140a] border-b border-[rgba(80,200,120,0.15)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('ticker')}>
                    <div className="flex items-center gap-1.5">
                      <span>Ticker</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1.5">
                      <span>LTP (₹)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('change_pct')}>
                    <div className="flex items-center gap-1.5">
                      <span>24h Change</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('rsi')}>
                    <div className="flex items-center gap-1.5">
                      <span>RSI (14)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('quant_score')}>
                    <div className="flex items-center gap-1.5">
                      <span>Quant Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4">AI Signal</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('volume')}>
                    <div className="flex items-center gap-1.5">
                      <span>Volume</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(80,200,120,0.08)]">
                {filteredItems.map((item) => (
                  <tr
                    key={item.ticker}
                    className="hover:bg-[rgba(80,200,120,0.06)] transition-colors group cursor-pointer"
                    onClick={() => {
                      selectTicker(item.ticker);
                      router.push('/terminal');
                    }}
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-[#00ff87] transition-colors">
                          {item.ticker}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">₹{item.price.toFixed(2)}</td>
                    <td className="p-4">
                      <ChangeBadge changePct={item.change_pct} />
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold ${
                          item.rsi >= 70 ? 'text-red-400 font-bold' : item.rsi <= 30 ? 'text-[#00ff87] font-bold' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {item.rsi.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={item.quant_score >= 0 ? 'text-[#00ff87] font-bold' : 'text-red-400 font-bold'}>
                        {item.quant_score >= 0 ? `+${item.quant_score.toFixed(3)}` : item.quant_score.toFixed(3)}
                      </span>
                    </td>
                    <td className="p-4">
                      <SignalBadge signal={item.recommendation || item.signal || 'HOLD'} />
                    </td>
                    <td className="p-4 text-[var(--text-muted)]">{item.volume.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">
                        Trade →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
