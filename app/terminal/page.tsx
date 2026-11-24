'use client';
import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useVortexSocket, BASE_PRICES } from '@/lib/websocket';
import { MetricCard } from '@/components/ui/MetricCard';
import CandlestickChart, { Timeframe } from '@/components/charts/CandlestickChart';
import OrderBookDepth from '@/components/charts/OrderBookDepth';
import IndicatorSubChart from '@/components/charts/IndicatorSubChart';
import { ParameterControls } from '@/components/terminal/ParameterControls';
import { TradeCalculator } from '@/components/terminal/TradeCalculator';
import { ExportToolbar } from '@/components/terminal/ExportToolbar';
import { StockHeader } from '@/components/terminal/StockHeader';
import { PaperTradingPanel } from '@/components/terminal/PaperTradingPanel';
import { OptionsChainView } from '@/components/terminal/OptionsChainView';
import { BullBearThesis } from '@/components/terminal/BullBearThesis';
import { StrategyBacktester } from '@/components/terminal/StrategyBacktester';
import { CorrelationMatrix } from '@/components/terminal/CorrelationMatrix';
import { InstitutionalFlowTracker } from '@/components/terminal/InstitutionalFlowTracker';
import { OrionOrb } from '@/components/orion/OrionOrb';
import { OrionVoiceContext } from '@/lib/orionVoice';
import { usePaperTrading } from '@/lib/usePaperTrading';
import {
  ShieldCheck, Zap, TrendingUp, DollarSign, BarChart2, Briefcase,
  Layers, Sparkles, LineChart, Compass, Activity, Sliders, ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

const QUICK_TICKERS = [
  'TCS_NSE', 'RELI_NSE', 'HDFC_NSE', 'INFY_NSE', 'ICICIBANK_NSE', 'SBIN_NSE', 'TATAMOTORS_NSE', 'ADANIENT_NSE'
];

type WorkspaceTab = 'chart' | 'paper' | 'options' | 'ai' | 'backtest' | 'macro';
type DockTab = 'rsi' | 'thesis' | 'calculator' | 'paper_quick' | 'none';
type SidebarTab = 'depth' | 'fundamentals' | 'parameters';

export default function TerminalPage() {
  const { status, snapshot, activeTicker, selectTicker, timeframe, subscribe, isTransitioning, pendingTicker } = useVortexSocket();
  const defaultPrice = (activeTicker && BASE_PRICES[activeTicker]) ? BASE_PRICES[activeTicker].price : 2248.40;
  const currentPrice = snapshot?.mid || defaultPrice;
  const targetPrice = Number(snapshot?.target || (currentPrice > 0 ? currentPrice * 1.035 : 0));
  const targetDelta = currentPrice > 0 ? ((targetPrice - currentPrice) / currentPrice) * 100 : 3.5;
  const throughput = Number(snapshot?.throughput || 1845);
  const latencyP50 = Number(snapshot?.latency_p50 || 520);
  const confidenceVal = Number(snapshot?.confidence || 85);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('chart');
  const [activeDock, setActiveDock] = useState<DockTab>('rsi');
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('depth');

  const { portfolio, updatePrice, executeOrder, closePosition } = usePaperTrading();

  // Sync latest price to paper trading positions
  useEffect(() => {
    if (currentPrice > 0 && activeTicker) {
      updatePrice(activeTicker, currentPrice);
    }
  }, [currentPrice, activeTicker, updatePrice]);

  // Global Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const key = e.key.toLowerCase();
      if (key === 'p') {
        setActiveTab((prev) => (prev === 'paper' ? 'chart' : 'paper'));
      } else if (key === 'o') {
        setActiveTab((prev) => (prev === 'options' ? 'chart' : 'options'));
      } else if (key === 't') {
        setActiveTab((prev) => (prev === 'backtest' ? 'chart' : 'backtest'));
      } else if (key === 'f') {
        setActiveTab((prev) => (prev === 'macro' ? 'chart' : 'macro'));
      } else if (key === 'c') {
        setActiveTab('chart');
      } else if (key === '1') {
        subscribe(activeTicker, 'LIVE');
      } else if (key === '2') {
        subscribe(activeTicker, '1D');
      } else if (key === '3') {
        subscribe(activeTicker, '1W');
      } else if (key === '4') {
        subscribe(activeTicker, '1M');
      } else if (key === '5') {
        subscribe(activeTicker, '6M');
      } else if (key === '6') {
        subscribe(activeTicker, '1Y');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTicker, subscribe]);

  const orionContext: OrionVoiceContext = {
    activeTicker,
    currentPrice,
    selectTicker,
    setActiveTab: (tab) => setActiveTab(tab),
    setTimeframe: (tf) => subscribe(activeTicker, tf),
    executePaperOrder: (order) => executeOrder(order),
    closePosition: (id, price) => closePosition(id, price),
    portfolioSummary: {
      equity: portfolio.cash + portfolio.positions.reduce((acc, p) => acc + p.shares * p.currentPrice, 0),
      cash: portfolio.cash,
      positionsCount: portfolio.positions.length,
    },
    signal: snapshot?.signal,
    confidence: snapshot?.confidence,
    targetPrice,
  };

  const activePosition = portfolio.positions.find((p) => p.ticker === activeTicker);

  return (
    <div className="min-h-screen flex flex-col bg-[#070a10] text-white w-full overflow-x-hidden font-mono selection:bg-[#50C878]/30">
      <AppHeader
        wsStatus={status}
        activeTicker={activeTicker}
        currentPath="/terminal"
        onTickerSelect={(t) => selectTicker(t)}
      />

      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
        {/* Top Institutional Header: Hero Quote & Ticker Selection */}
        <div className="w-full bg-[#0b0f19]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-4">
          <StockHeader
            activeTicker={activeTicker}
            snapshot={snapshot}
            currentPrice={currentPrice}
            isTransitioning={isTransitioning}
          />

          {/* Navigation Bar: Quick Tickers & Workspace Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
            {/* Quick Tickers Horizontal Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full sm:max-w-xl pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mr-1 hidden sm:inline">
                Watch:
              </span>
              {QUICK_TICKERS.map((t) => (
                <button
                  key={t}
                  onClick={() => selectTicker(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeTicker === t
                      ? 'bg-[#50C878] text-black font-bold shadow-[0_0_12px_rgba(80,200,120,0.35)]'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {t.split('_')[0]}
                </button>
              ))}
            </div>

            {/* Primary Workspace View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl text-xs overflow-x-auto">
              <button
                onClick={() => setActiveTab('chart')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'chart'
                    ? 'bg-[#50C878] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Trading Desk</span>
              </button>
              <button
                onClick={() => setActiveTab('paper')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'paper'
                    ? 'bg-[#50C878] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Paper Desk</span>
                {portfolio.positions.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('options')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'options'
                    ? 'bg-[#50C878] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Options Chain</span>
              </button>
              <button
                onClick={() => setActiveTab('backtest')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'backtest'
                    ? 'bg-[#50C878] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Backtest</span>
              </button>
              <button
                onClick={() => setActiveTab('macro')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'macro'
                    ? 'bg-[#50C878] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Flows & Sectors</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'ai'
                    ? 'bg-[#50C878] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>AI Thesis</span>
              </button>
            </div>

            {/* Quick Export Toolbar */}
            <div className="hidden xl:flex items-center">
              <ExportToolbar snapshot={snapshot} />
            </div>
          </div>
        </div>

        {/* Compact KPI Stats Strip */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="LAST PRICE"
            value={`₹${currentPrice.toFixed(2)}`}
            animatedValue={currentPrice}
            animatedFormatter={(v) => `₹${v.toFixed(2)}`}
            change={snapshot?.change}
            changePct={snapshot?.change_pct}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <MetricCard
            title="TARGET PRICE"
            value={`₹${targetPrice.toFixed(2)}`}
            animatedValue={targetPrice}
            animatedFormatter={(v) => `₹${v.toFixed(2)}`}
            subValue={`${targetDelta >= 0 ? '+' : ''}${targetDelta.toFixed(1)}%`}
            badge={
              <span className="w-fit px-2.5 py-0.5 rounded-full bg-[#00ff87]/20 text-[#00ff87] text-[10px] font-bold tabular-nums">
                {confidenceVal.toFixed(0)}% Conf.
              </span>
            }
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <MetricCard
            title="THROUGHPUT"
            value={`${throughput.toFixed(0)}`}
            animatedValue={throughput}
            animatedFormatter={(v) => `${v.toFixed(0)}`}
            subValue="pkts/s"
            icon={<Zap className="w-4 h-4" />}
          />
          <MetricCard
            title="LATENCY"
            value={`${latencyP50.toFixed(0)} μs`}
            animatedValue={latencyP50}
            animatedFormatter={(v) => `${v.toFixed(0)} μs`}
            subValue="p50 latency"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </div>

        {/* Main Workspace Body */}
        {activeTab === 'paper' ? (
          <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <PaperTradingPanel currentPrice={currentPrice} activeTicker={activeTicker} />
          </div>
        ) : activeTab === 'options' ? (
          <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <OptionsChainView currentPrice={currentPrice} activeTicker={activeTicker} />
          </div>
        ) : activeTab === 'backtest' ? (
          <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <StrategyBacktester candles={snapshot?.candles || []} activeTicker={activeTicker} />
          </div>
        ) : activeTab === 'macro' ? (
          <div className="w-full flex flex-col gap-5">
            <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <InstitutionalFlowTracker />
            </div>
            <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <CorrelationMatrix />
            </div>
          </div>
        ) : activeTab === 'ai' ? (
          <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <BullBearThesis snapshot={snapshot} activeTicker={activeTicker} currentPrice={currentPrice} />
          </div>
        ) : (
          /* Clean, Uncongested Trading Desk Layout */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Primary Center Workspace (8-9 columns) */}
            <div className="w-full lg:col-span-8 xl:col-span-9 flex flex-col gap-4 min-w-0">
              {/* Candlestick Chart (Hero) */}
              <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <CandlestickChart
                  candles={snapshot?.candles || []}
                  activeTicker={activeTicker}
                  currentTimeframe={timeframe as Timeframe}
                  onTimeframeChange={(tf) => subscribe(activeTicker, tf)}
                  prevClose={snapshot?.prev_close}
                  isTransitioning={isTransitioning}
                  pendingTicker={pendingTicker}
                  positions={portfolio.positions}
                />
              </div>

              {/* Dockable Tool Tray Tabs (Replaces vertical clutter with clean tab switching) */}
              <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-lg flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/[0.06] overflow-x-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-2 hidden sm:inline">
                      Desk Tray:
                    </span>
                    <button
                      onClick={() => setActiveDock('rsi')}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activeDock === 'rsi'
                          ? 'bg-[#50C878]/15 text-[#00ff87] border border-[#50C878]/30 font-bold'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>RSI Sub-Chart</span>
                    </button>
                    <button
                      onClick={() => setActiveDock('thesis')}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activeDock === 'thesis'
                          ? 'bg-[#50C878]/15 text-[#00ff87] border border-[#50C878]/30 font-bold'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span>AI Thesis</span>
                    </button>
                    <button
                      onClick={() => setActiveDock('calculator')}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activeDock === 'calculator'
                          ? 'bg-[#50C878]/15 text-[#00ff87] border border-[#50C878]/30 font-bold'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Position Sizing</span>
                    </button>
                    <button
                      onClick={() => setActiveDock('paper_quick')}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activeDock === 'paper_quick'
                          ? 'bg-[#50C878]/15 text-[#00ff87] border border-[#50C878]/30 font-bold'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Open Positions ({portfolio.positions.length})</span>
                    </button>
                  </div>

                  {activeDock !== 'none' && (
                    <button
                      onClick={() => setActiveDock('none')}
                      className="p-1 text-slate-500 hover:text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Collapse</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dock Tray Body */}
                {activeDock !== 'none' && (
                  <div className="p-4 sm:p-5">
                    {activeDock === 'rsi' && (
                      <IndicatorSubChart candles={snapshot?.candles || []} />
                    )}
                    {activeDock === 'thesis' && (
                      <BullBearThesis snapshot={snapshot} activeTicker={activeTicker} currentPrice={currentPrice} />
                    )}
                    {activeDock === 'calculator' && (
                      <TradeCalculator currentPrice={currentPrice} activeTicker={activeTicker} />
                    )}
                    {activeDock === 'paper_quick' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10">
                          <span className="font-bold text-white">Active Virtual Holdings</span>
                          <button
                            onClick={() => setActiveTab('paper')}
                            className="text-cyan-300 hover:underline text-[10px]"
                          >
                            Open Full Paper Desk →
                          </button>
                        </div>
                        {portfolio.positions.length === 0 ? (
                          <div className="py-6 text-center text-slate-500 text-xs">
                            No open positions. Use Position Sizing or speak to ORION to place an order.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {portfolio.positions.map((pos) => {
                              const posPnl = (currentPrice - pos.entryPrice) * pos.shares;
                              return (
                                <div
                                  key={pos.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs"
                                >
                                  <div>
                                    <span className="font-bold text-white">{pos.ticker.split('_')[0]}</span>
                                    <span className="text-slate-500 ml-2">
                                      {pos.side} {pos.shares} shs @ ₹{pos.entryPrice.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={clsx(
                                        'font-bold',
                                        posPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                      )}
                                    >
                                      {posPnl >= 0 ? '+' : ''}₹{posPnl.toFixed(2)}
                                    </span>
                                    <button
                                      onClick={() => closePosition(pos.id, currentPrice)}
                                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-rose-600 hover:text-white text-[10px] text-slate-300 transition-colors"
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Analytical Inspector Column (3-4 columns) */}
            <div className="w-full lg:col-span-4 xl:col-span-3 flex flex-col gap-4 min-w-0">
              {/* Active Position Banner (if open on this ticker) */}
              {activePosition && (
                <div className="w-full rounded-2xl bg-emerald-950/30 border border-emerald-500/30 p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Open Position ({activePosition.side})</span>
                    </span>
                    <button
                      onClick={() => closePosition(activePosition.id, currentPrice)}
                      className="text-[10px] bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white px-2 py-0.5 rounded transition-colors cursor-pointer"
                    >
                      Exit MKT
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">
                      {activePosition.shares} shs @ ₹{activePosition.entryPrice.toFixed(2)}
                    </span>
                    <span
                      className={clsx(
                        'font-bold text-sm',
                        (currentPrice - activePosition.entryPrice) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      )}
                    >
                      {(currentPrice - activePosition.entryPrice) >= 0 ? '+' : ''}₹
                      {((currentPrice - activePosition.entryPrice) * activePosition.shares).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Inspector Card with Clean Tab Navigation */}
              <div className="w-full rounded-2xl bg-[#0b0f19]/90 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col">
                {/* Sidebar Header Tabs */}
                <div className="flex items-center justify-between p-2 bg-black/40 border-b border-white/[0.06]">
                  <button
                    onClick={() => setActiveSidebarTab('depth')}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer',
                      activeSidebarTab === 'depth'
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Depth
                  </button>
                  <button
                    onClick={() => setActiveSidebarTab('fundamentals')}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer',
                      activeSidebarTab === 'fundamentals'
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Valuation
                  </button>
                  <button
                    onClick={() => setActiveSidebarTab('parameters')}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer',
                      activeSidebarTab === 'parameters'
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Model
                  </button>
                </div>

                {/* Sidebar Tab Content */}
                <div className="p-4 sm:p-5">
                  {activeSidebarTab === 'depth' ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-white/5">
                        <span>Level 2 Order Book</span>
                        <span>Real-Time Imbalance</span>
                      </div>
                      <OrderBookDepth
                        bids={snapshot?.bids_l2 || []}
                        asks={snapshot?.asks_l2 || []}
                        midPrice={currentPrice}
                      />
                    </div>
                  ) : activeSidebarTab === 'fundamentals' ? (
                    <div className="flex flex-col gap-3 font-mono text-xs">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-white/5">
                        <span>Financial Metrics</span>
                        <span>Alpha Vantage / NSE</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">P/E Ratio</span>
                        <span className="text-white font-bold tabular-nums">
                          {snapshot?.fundamental?.pe?.toFixed(2) || '28.40'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Market Cap</span>
                        <span className="text-white font-bold tabular-nums">
                          ₹{((snapshot?.fundamental?.market_cap || 1420000000000) / 1e9).toFixed(1)}B
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Return on Equity</span>
                        <span className="text-[#00ff87] font-bold tabular-nums">
                          {((snapshot?.fundamental?.roe || 0.48) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Debt to Equity</span>
                        <span className="text-white font-bold tabular-nums">
                          {snapshot?.fundamental?.debt_to_equity?.toFixed(2) || '0.08'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">52W High</span>
                        <span className="text-[#00ff87] font-bold tabular-nums">
                          ₹{snapshot?.high?.toFixed(2) || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">52W Low</span>
                        <span className="text-rose-400 font-bold tabular-nums">
                          ₹{snapshot?.low?.toFixed(2) || '—'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-white/5">
                        <span>Quant Tuners</span>
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <ParameterControls />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Holographic ORION Voice Assistant Interface */}
      <OrionOrb context={orionContext} />
    </div>
  );
}
