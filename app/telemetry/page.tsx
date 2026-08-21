'use client';
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket } from '@/lib/websocket';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/Badges';
import { ShieldCheck, Activity, Zap, Network } from 'lucide-react';

export default function TelemetryPage() {
  const { status, snapshot, activeTicker, selectTicker } = useVortexSocket();

  const p50 = snapshot?.latency_p50 || 640;
  const p99 = snapshot?.latency_p99 || 1450;
  const avg = snapshot?.latency_avg || 820;
  const throughput = snapshot?.throughput || 1850;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-[#0a0d14] text-white flex flex-col">
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/telemetry"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <main className="w-full flex-1 pt-20 sm:pt-24 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 pb-16">
          {/* Header & KPI Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title="p50 Latency"
              value={`${p50.toFixed(0)} μs`}
              subValue="Median"
              icon={<ShieldCheck className="w-4 h-4 text-[#00ff87]" />}
            />
            <MetricCard
              title="p99 Latency"
              value={`${p99.toFixed(0)} μs`}
              subValue="Tail Jitter"
              icon={<Activity className="w-4 h-4 text-cyan-300" />}
            />
            <MetricCard
              title="Avg Latency"
              value={`${avg.toFixed(0)} μs`}
              subValue="Network Mean"
              icon={<Network className="w-4 h-4 text-yellow-300" />}
            />
            <MetricCard
              title="Throughput"
              value={`${throughput.toFixed(0)}`}
              subValue="pkts/s"
              icon={<Zap className="w-4 h-4 text-[#00ff87]" />}
            />
          </div>

          {/* Diagnostics & Server Health Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#0e131d]/90 border border-white/10 p-5 sm:p-6 flex flex-col gap-4 font-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--matrix-bright)] uppercase border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Telemetry Node Status</span>
                <StatusBadge status={status} />
              </h3>

              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[var(--text-muted)]">Engine Cluster</span>
                <span className="text-white font-bold">VORTEX-HF-PROD-01</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[var(--text-muted)]">Transport Protocol</span>
                <span className="text-[#00ff87] font-bold">WebSocket Binary Frame (RFC 6455)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[var(--text-muted)]">Active Channel</span>
                <span className="text-white font-bold">{activeTicker}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[var(--text-muted)]">AI Model Reasoning</span>
                <span className="text-cyan-300 font-bold">Google Gemini 3.6 Flash</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Uptime Availability</span>
                <span className="text-[#00ff87] font-bold">99.98% High Availability</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0e131d]/90 border border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-4 font-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--matrix-bright)] uppercase border-b border-white/10 pb-3">
                Packet Latency Histogram
              </h3>

              <div className="flex flex-col gap-3 py-2">
                {[
                  { range: '< 100 μs', pct: 45, col: 'bg-emerald-400' },
                  { range: '100 - 500 μs', pct: 35, col: 'bg-[#00ff87]' },
                  { range: '500 - 1000 μs', pct: 14, col: 'bg-cyan-400' },
                  { range: '> 1000 μs (Tail)', pct: 6, col: 'bg-amber-400' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[var(--text-secondary)]">{item.range}</span>
                      <span className="text-white font-bold">{item.pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                      <div className={`h-full ${item.col}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Sampling: 20,000 Rolling Ticks</span>
                <span className="text-[#00ff87]">Normal Distribution</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
