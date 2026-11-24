'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Brain, ChartNoAxesCombined, ChevronUp, Cpu, Gauge, Radar, ShieldCheck, Zap } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import { Footer } from '@/components/landing/Footer';
import { MarketRibbon } from '@/components/landing/MarketRibbon';
import { TerminalMockup } from '@/components/landing/TerminalMockup';
import { useVortexSocket } from '@/lib/websocket';

const features = [
  { icon: Radar, title: 'Live market structure', text: 'Read price, volume, and Level 2 liquidity together instead of across disconnected tabs.', metric: 'L2 depth' },
  { icon: Brain, title: 'AI with market context', text: 'Turn technical data and current news into a concise, explainable trading thesis.', metric: '88% confidence' },
  { icon: ShieldCheck, title: 'Risk at the decision point', text: 'Position sizing and scenario checks sit beside the trade, where they are useful.', metric: 'Built in' },
];

const modules = [
  { href: '/terminal', number: '01', title: 'Execution workspace', text: 'Charts, order flow, options, and paper trading in one focused desk.', icon: ChartNoAxesCombined, accent: '#00ff87' },
  { href: '/screener', number: '02', title: 'Opportunity radar', text: 'A clear shortlist of equities ranked by signals, momentum, and quality.', icon: Gauge, accent: '#38bdf8' },
  { href: '/analyst', number: '03', title: 'Research copilot', text: 'Ask better questions and get a structured view of the trade setup.', icon: Brain, accent: '#a855f7' },
];

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal-on-scroll').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">{children}</span>;
}

export default function LandingPage() {
  const { status, activeTicker, selectTicker } = useVortexSocket();
  const [showTop, setShowTop] = useState(false);
  useReveal();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070a10] text-white">
      <AppHeader wsStatus={status} activeTicker={activeTicker} currentPath="/" onTickerSelect={selectTicker} />
      <main id="main-content">
        <section className="landing-hero relative isolate overflow-hidden px-5 sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-70 landing-grid" />
          <div className="pointer-events-none absolute left-[18%] top-0 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-[130px]" />
          <div className="pointer-events-none absolute right-[-8rem] top-40 h-[24rem] w-[24rem] rounded-full bg-cyan-500/10 blur-[130px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="flex max-w-xl flex-col items-start text-left">
              <Eyebrow><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#00ff87]" /> Live intelligence for Indian markets</Eyebrow>
              <h1 className="mt-6 text-balance text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl xl:text-7xl">See the signal.<br /><span className="bg-gradient-to-r from-emerald-300 via-[#00ff87] to-cyan-300 bg-clip-text text-transparent">Move with clarity.</span></h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">ORION brings live market structure, quantitative research, and risk context into one calm, high-performance workspace.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/terminal" className="group inline-flex items-center gap-2 rounded-xl bg-[#00f58a] px-5 py-3 text-sm font-bold text-[#04110a] shadow-[0_10px_30px_rgba(0,255,135,.2)] transition hover:-translate-y-0.5 hover:bg-[#45ffab]">Open terminal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link><Link href="/screener" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.08]">Explore markets</Link></div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[11px] text-slate-500"><span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-emerald-400" /> Live telemetry</span><span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-cyan-400" /> NSE &amp; BSE coverage</span><span className="flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-violet-400" /> AI research</span></div>
            </div>
            <div className="reveal-on-scroll w-full lg:pt-6"><TerminalMockup /></div>
          </div>
        </section>
        <div className="border-y border-white/[0.07] bg-[#05080d]"><MarketRibbon /></div>
        <section className="landing-section px-5 sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16"><div className="reveal-on-scroll"><Eyebrow>Built for better decisions</Eyebrow><h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">A complete desk,<br />without the noise.</h2><p className="mt-5 max-w-md text-sm leading-7 text-slate-400">The platform is deliberately organized around a trader&apos;s sequence: discover, validate, act, and review.</p><Link href="/dashboard" className="mt-7 inline-flex items-center gap-2 font-mono text-xs font-bold text-emerald-300 transition hover:text-emerald-100">View market dashboard <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">{features.map(({ icon: Icon, title, text, metric }, index) => <article key={title} className="reveal-on-scroll bg-[#0b1019] p-6 sm:p-7" style={{ transitionDelay: `${index * 90}ms` }}><Icon className="h-5 w-5 text-emerald-300" /><div className="mt-7 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400">{metric}</div><h3 className="mt-3 text-lg font-bold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></article>)}</div></div></section>
        <section className="border-y border-white/[0.06] bg-[#090e17] px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 sm:grid-cols-4">{[['12,480', 'Packets / sec'], ['480μs', 'P50 latency'], ['40+', 'Tracked instruments'], ['24/7', 'Workspace access']].map(([value, label]) => <div key={label} className="border-l border-white/[0.08] px-5 first:border-l-0 sm:px-8"><div className="font-mono text-2xl font-black text-emerald-300 sm:text-3xl">{value}</div><div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div></div>)}</div></section>
        <section className="landing-section px-5 sm:px-8"><div className="mx-auto max-w-7xl"><div className="reveal-on-scroll flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Eyebrow>One system, three workspaces</Eyebrow><h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Choose your starting point.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-400">Each workspace uses the same live data, so your research never loses its context.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{modules.map(({ href, number, title, text, icon: Icon, accent }) => <Link key={href} href={href} className="group reveal-on-scroll relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c121d] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#101824] sm:p-7"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold" style={{ color: accent }}>{number}</span><Icon className="h-5 w-5 text-slate-400 transition group-hover:text-white" /></div><h3 className="mt-14 text-xl font-bold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p><div className="mt-8 flex items-center gap-2 font-mono text-xs font-bold" style={{ color: accent }}>Open workspace <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></div></Link>)}</div></div></section>
        <section className="px-5 pb-20 sm:px-8 sm:pb-28"><div className="reveal-on-scroll relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-emerald-400/20 bg-[#0c1b15] px-6 py-12 sm:px-12 sm:py-16"><div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/15 blur-[100px]" /><div className="relative max-w-2xl"><Eyebrow><Cpu className="h-3.5 w-3.5" /> Ready when you are</Eyebrow><h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-5xl">A calmer way to read the market.</h2><p className="mt-5 text-sm leading-7 text-slate-300">Start with a live market overview, then move directly into the instruments that deserve your attention.</p><Link href="/terminal" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-100">Launch ORION <ArrowRight className="h-4 w-4" /></Link></div></div></section>
      </main>
      {showTop && <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-[#101722]/90 p-3 text-emerald-300 shadow-xl backdrop-blur transition hover:bg-emerald-400 hover:text-slate-950"><ChevronUp className="h-5 w-5" /></button>}
      <Footer />
    </div>
  );
}
