'use client';
import Link from 'next/link';
import {
  Home, BarChart2, Activity, Brain, Newspaper, Cpu,
  TrendingUp, Map, BookOpen, Calendar,
} from 'lucide-react';

const QUICK_LINKS = [
  { href: '/',              label: 'Home',           Icon: Home,       color: '#10b981' },
  { href: '/terminal',      label: 'Live Terminal',  Icon: BarChart2,  color: '#10b981' },
  { href: '/screener',      label: 'Stock Screener', Icon: Activity,   color: '#06b6d4' },
  { href: '/markets',       label: 'Market Overview',Icon: TrendingUp, color: '#06b6d4' },
  { href: '/analyst',       label: 'AI Analyst',     Icon: Brain,      color: '#818cf8' },
  { href: '/news',          label: 'Financial News', Icon: Newspaper,  color: '#fbbf24' },
  { href: '/sectors',       label: 'Sectors',        Icon: Map,        color: '#f97316' },
  { href: '/watchlist',     label: 'Watchlist',      Icon: BookOpen,   color: '#06b6d4' },
  { href: '/earnings',      label: 'Earnings',       Icon: Calendar,   color: '#a78bfa' },
  { href: '/telemetry',     label: 'Telemetry',      Icon: Cpu,        color: '#10b981' },
];

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-white relative overflow-hidden"
      style={{ background: '#030712' }}
    >
      {/* Ambient radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 800px 400px at 50% 30%, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-3xl w-full">

        {/* 404 Number */}
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-[8rem] sm:text-[10rem] font-black font-mono leading-none select-none"
            style={{
              backgroundImage: 'linear-gradient(135deg, #10b981 0%, #06b6d4 60%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.06em',
              filter: 'drop-shadow(0 0 60px rgba(16,185,129,0.3))',
            }}
            aria-hidden="true"
          >
            404
          </span>

          {/* ORION logo mark */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-black text-sm"
              style={{
                background: 'linear-gradient(135deg, #00ff87, #006b3a)',
                boxShadow: '0 0 20px rgba(0,255,135,0.3)',
              }}
              aria-hidden="true"
            >
              O
            </div>
            <span className="font-sans font-black text-lg tracking-[2.5px] uppercase text-white">
              ORION
            </span>
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
              style={{
                background: 'rgba(16,185,129,0.1)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              4.0
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-2xl sm:text-3xl font-sans font-bold"
            style={{ letterSpacing: '-0.02em' }}
          >
            Page Not Found
          </h1>
          <p
            className="text-sm sm:text-base font-sans leading-relaxed max-w-md"
            style={{ color: 'rgba(240,255,248,0.55)' }}
          >
            The route you requested doesn&apos;t exist or may have moved. Use the navigation below to find what you&apos;re looking for.
          </p>
        </div>

        {/* Quick links grid */}
        <nav aria-label="Platform navigation">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {QUICK_LINKS.map(({ href, label, Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 group text-center"
                style={{
                  background: 'rgba(14,19,29,0.7)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
                  (e.currentTarget as HTMLElement).style.background = `${color}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(14,19,29,0.7)';
                }}
              >
                <Icon
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  style={{ color }}
                  aria-hidden="true"
                />
                <span
                  className="text-[11px] font-mono font-semibold"
                  style={{ color: 'rgba(240,255,248,0.7)' }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Back home CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-sans font-bold text-sm transition-all duration-300"
          style={{
            background: '#10b981',
            color: '#030712',
            boxShadow: '0 0 24px rgba(16,185,129,0.3)',
          }}
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Return to ORION
        </Link>
      </div>
    </div>
  );
}
