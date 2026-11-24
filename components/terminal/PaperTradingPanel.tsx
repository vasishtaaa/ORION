'use client';

import React, { useState } from 'react';
import { usePaperTrading } from '@/lib/usePaperTrading';
import { Briefcase, Download, RefreshCw, XCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface PaperTradingPanelProps {
  currentPrice: number;
  activeTicker: string;
}

export function PaperTradingPanel({ currentPrice, activeTicker }: PaperTradingPanelProps) {
  const {
    portfolio,
    metrics,
    executeOrder,
    closePosition,
    resetAccount,
    exportJournalCsv,
  } = usePaperTrading();

  const [activeTab, setActiveTab] = useState<'positions' | 'orders'>('positions');
  const [orderShares, setOrderShares] = useState<number>(100);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const handlePlaceOrder = () => {
    if (orderShares <= 0) {
      setStatusMsg({ text: 'Shares must be greater than 0', error: true });
      return;
    }
    const res = executeOrder({
      ticker: activeTicker,
      side: orderType,
      shares: orderShares,
      price: currentPrice,
      type: 'MARKET',
    });

    setStatusMsg({ text: res.message, error: !res.success });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <div className="w-full flex flex-col gap-4 font-mono text-xs">
      {/* Portfolio Header Metric Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-black/40 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#50C878]/10 text-[#50C878] border border-[#50C878]/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Virtual Portfolio Equity</div>
            <div className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>₹{metrics.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span
                className={clsx(
                  'text-xs px-2 py-0.5 rounded font-bold',
                  metrics.totalReturn >= 0 ? 'bg-emerald-950/80 text-emerald-400' : 'bg-rose-950/80 text-rose-400'
                )}
              >
                {metrics.totalReturn >= 0 ? '+' : ''}
                {metrics.totalReturnPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div>
            <span className="text-[10px] text-slate-500 block">AVAILABLE CASH</span>
            <span className="text-slate-200 font-bold">₹{metrics.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">UNREALIZED P&L</span>
            <span className={clsx('font-bold', metrics.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {metrics.unrealizedPnl >= 0 ? '+' : ''}₹{metrics.unrealizedPnl.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">REALIZED P&L</span>
            <span className={clsx('font-bold', metrics.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {metrics.realizedPnl >= 0 ? '+' : ''}₹{metrics.realizedPnl.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">WIN RATE</span>
            <span className="text-cyan-300 font-bold">{metrics.winRate.toFixed(0)}% ({metrics.closedTradesCount} trades)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJournalCsv}
            title="Export Trade Journal to CSV"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset virtual portfolio to initial ₹10,00,000 balance?')) {
                resetAccount();
              }
            }}
            title="Reset Portfolio"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Order Ticket Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Direct Order:</span>
          <span className="text-white font-bold">{activeTicker.split('_')[0]}</span>
          <span className="text-slate-500">@ ₹{currentPrice.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={orderShares}
            onChange={(e) => setOrderShares(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-24 px-2 py-1 rounded bg-black/60 border border-white/15 text-white text-xs text-right font-mono focus:outline-none focus:border-[#50C878]"
            placeholder="Shares"
          />
          <button
            onClick={() => {
              setOrderType('BUY');
              handlePlaceOrder();
            }}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors cursor-pointer"
          >
            BUY MKT
          </button>
          <button
            onClick={() => {
              setOrderType('SELL');
              handlePlaceOrder();
            }}
            className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            SELL MKT
          </button>
        </div>

        {statusMsg && (
          <div className={clsx('text-xs flex items-center gap-1.5', statusMsg.error ? 'text-rose-400' : 'text-emerald-400')}>
            {statusMsg.error ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('positions')}
          className={clsx(
            'px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors',
            activeTab === 'positions' ? 'bg-[#50C878] text-black' : 'text-slate-400 hover:text-white'
          )}
        >
          Open Positions ({portfolio.positions.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={clsx(
            'px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors',
            activeTab === 'orders' ? 'bg-[#50C878] text-black' : 'text-slate-400 hover:text-white'
          )}
        >
          Trade Log ({portfolio.orderHistory.length})
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full">
        {activeTab === 'positions' ? (
          portfolio.positions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No active positions. Execute a BUY or SELL order to start paper trading.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 text-[10px] uppercase">
                  <th className="py-2 px-2">Ticker</th>
                  <th className="py-2 px-2">Side</th>
                  <th className="py-2 px-2 text-right">Shares</th>
                  <th className="py-2 px-2 text-right">Entry</th>
                  <th className="py-2 px-2 text-right">Current</th>
                  <th className="py-2 px-2 text-right">Unrealized P&L</th>
                  <th className="py-2 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {portfolio.positions.map((pos) => {
                  const pnl =
                    pos.side === 'BUY'
                      ? (currentPrice - pos.entryPrice) * pos.shares
                      : (pos.entryPrice - currentPrice) * pos.shares;
                  const pnlPct = (pnl / (pos.entryPrice * pos.shares)) * 100;

                  return (
                    <tr key={pos.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-2 font-bold text-white">{pos.ticker.split('_')[0]}</td>
                      <td className="py-2 px-2">
                        <span
                          className={clsx(
                            'px-1.5 py-0.5 rounded text-[10px] font-bold',
                            pos.side === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          )}
                        >
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-slate-200">{pos.shares}</td>
                      <td className="py-2 px-2 text-right text-slate-300">₹{pos.entryPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-white">₹{currentPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right">
                        <span className={clsx('font-bold', pnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                          {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}
                          {pnlPct.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => closePosition(pos.id, currentPrice)}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-rose-600 hover:text-white text-slate-300 text-[10px] transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : portfolio.orderHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No order history recorded yet.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 text-[10px] uppercase">
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">Ticker</th>
                <th className="py-2 px-2">Side</th>
                <th className="py-2 px-2 text-right">Shares</th>
                <th className="py-2 px-2 text-right">Price</th>
                <th className="py-2 px-2 text-right">Realized P&L</th>
                <th className="py-2 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {portfolio.orderHistory.slice(0, 15).map((ord) => (
                <tr key={ord.id} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-2 text-slate-500 text-[10px]">
                    {new Date(ord.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-2 font-bold text-white">{ord.ticker.split('_')[0]}</td>
                  <td className="py-2 px-2">
                    <span
                      className={clsx(
                        'px-1.5 py-0.5 rounded text-[10px] font-bold',
                        ord.side === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      )}
                    >
                      {ord.side}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-200">{ord.shares}</td>
                  <td className="py-2 px-2 text-right text-slate-300">₹{ord.price.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">
                    {ord.realizedPnl !== undefined ? (
                      <span className={clsx('font-bold', ord.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                        {ord.realizedPnl >= 0 ? '+' : ''}₹{ord.realizedPnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-semibold">
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
