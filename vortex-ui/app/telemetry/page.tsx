'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useVortexSocket } from '@/lib/websocket';
import TelemetryLine from '@/components/canvas/TelemetryLine';
import { StatChip, LiveBadge } from '@/components/ui/Badges';

const AppHeader = dynamic(() => import('@/components/layout/AppHeader'), { ssr: false });

export default function TelemetryPage() {
  const { status, snapshot, activeTicker } = useVortexSocket();
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [throughputHistory, setThroughputHistory] = useState<number[]>([]);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!snapshot) return;
    setLatencyHistory(h => [...h.slice(-60), snapshot.latency_avg ?? 0]);
    setThroughputHistory(h => [...h.slice(-60), snapshot.throughput ?? 0]);
    setPriceHistory(h => [...h.slice(-120), snapshot.mid ?? 0]);
  }, [snapshot]);

  const fmt = (sec: number) => `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden gap-6">
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/telemetry" />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-6">
        {/* Header Card */}
        <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          <h2 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">SYSTEM TELEMETRY</h2>
          <p className="font-mono text-xs font-semibold mt-1 text-[var(--text-muted)]">REAL-TIME ENGINE PERFORMANCE METRICS</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <p className="font-mono text-[10px] font-bold tracking-widest mb-2 text-[var(--text-muted)]">WS STATUS</p>
            <LiveBadge label={status.toUpperCase()} color={status === 'connected' ? 'green' : status === 'connecting' ? 'yellow' : 'red'} />
          </div>
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <p className="font-mono text-[10px] font-bold tracking-widest mb-2 text-[var(--text-muted)]">UPTIME</p>
            <span className="font-mono text-sm font-semibold text-[var(--matrix)]">{fmt(uptime)}</span>
          </div>
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <p className="font-mono text-[10px] font-bold tracking-widest mb-2 text-[var(--text-muted)]">AVG LATENCY</p>
            <span className="font-mono text-sm font-semibold text-[var(--matrix-bright)]">{snapshot?.latency_avg?.toFixed(1) ?? '—'}μs</span>
          </div>
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <p className="font-mono text-[10px] font-bold tracking-widest mb-2 text-[var(--text-muted)]">THROUGHPUT</p>
            <span className="font-mono text-sm font-semibold text-[var(--matrix-bright)]">{snapshot?.throughput?.toFixed(0) ?? '—'} msg/s</span>
          </div>
        </div>

        {/* Telemetry Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col gap-4">
            <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">LATENCY (μs) — LIVE</h3>
            <TelemetryLine data={latencyHistory} color="#50C878" height={100} label="PROCESSING LATENCY" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <StatChip label="AVG" value={`${snapshot?.latency_avg?.toFixed(1) ?? '0'}μs`} mono />
              <StatChip label="P50" value={`${snapshot?.latency_p50?.toFixed(1) ?? '0'}μs`} mono />
              <StatChip label="P99" value={`${snapshot?.latency_p99?.toFixed(1) ?? '0'}μs`} mono />
            </div>
          </div>
          <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col gap-4">
            <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">THROUGHPUT (msg/s)</h3>
            <TelemetryLine data={throughputHistory} color="#00ff87" height={100} label="MESSAGE THROUGHPUT" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <StatChip label="CURRENT" value={`${snapshot?.throughput?.toFixed(0) ?? '0'}/s`} mono />
              <StatChip label="PEAK" value={`${Math.max(...throughputHistory, 0).toFixed(0)}/s`} mono />
            </div>
          </div>
        </div>

        {/* Price History */}
        <div className="p-6 rounded-2xl border bg-[#000e07]/90 backdrop-blur-xl border-[rgba(80,200,120,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col gap-4">
          <h3 className="font-sans text-sm font-black tracking-widest uppercase text-[var(--matrix-bright)]">PRICE FEED — {activeTicker}</h3>
          <TelemetryLine data={priceHistory} color="#50C878" height={120} label={`LIVE MID PRICE (₹)`} />
        </div>
      </div>
    </div>
  );
}
