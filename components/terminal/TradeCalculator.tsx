'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { validateTradeForm, calculateTradeMetrics, TradeInputForm } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { usePaperTrading } from '@/lib/usePaperTrading';

interface TradeCalculatorProps {
  currentPrice: number;
  activeTicker: string;
}

export function TradeCalculator({ currentPrice = 2248.40, activeTicker = 'TCS_NSE' }: TradeCalculatorProps) {
  const { success, error } = useToast();
  const { executeOrder } = usePaperTrading();

  const [form, setForm] = useState<TradeInputForm>({
    accountSize: 500000,
    riskPercentage: 1.0,
    entryPrice: currentPrice || 2248.40,
    stopLossPrice: Number(((currentPrice || 2248.40) * 0.985).toFixed(2)),
    targetPrice: Number(((currentPrice || 2248.40) * 1.035).toFixed(2)),
  });

  const currentPriceRef = useRef(currentPrice);
  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  // Sync entry price and targets when active ticker changes
  useEffect(() => {
    const price = currentPriceRef.current;
    if (price > 0) {
      setForm((prev) => ({
        ...prev,
        entryPrice: price,
        stopLossPrice: Number((price * 0.985).toFixed(2)),
        targetPrice: Number((price * 1.035).toFixed(2)),
      }));
    }
  }, [activeTicker]);

  const validation = useMemo(() => validateTradeForm(form), [form]);
  const metrics = useMemo(() => calculateTradeMetrics(form), [form]);

  const handleChange = (field: keyof TradeInputForm, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleExecutePaperTrade = (side: 'BUY' | 'SELL') => {
    if (!validation.isValid || !metrics) {
      error('Please fix validation errors before executing trade ticket');
      return;
    }

    const res = executeOrder({
      ticker: activeTicker,
      side,
      shares: metrics.shares,
      price: form.entryPrice,
      type: 'MARKET',
      stopLoss: form.stopLossPrice,
      target: form.targetPrice,
    });

    if (res.success) {
      success(res.message);
    } else {
      error(res.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-[rgba(80,200,120,0.12)]">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00ff87]" />
          <h4 className="text-xs font-mono font-bold text-[var(--matrix-bright)] uppercase">
            Risk & Position Sizing Calculator
          </h4>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          {activeTicker} @ ₹{currentPrice.toFixed(2)}
        </span>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Account Size */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-[var(--text-secondary)]">Account Size (₹)</label>
          <input
            type="number"
            value={form.accountSize}
            onChange={(e) => handleChange('accountSize', Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-[#00140a] border border-[rgba(80,200,120,0.2)] text-xs font-mono text-white focus:outline-none focus:border-[#00ff87]"
          />
          {validation.errors.accountSize && (
            <span className="text-[9px] font-mono text-red-400">{validation.errors.accountSize}</span>
          )}
        </div>

        {/* Risk Percentage */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-[var(--text-secondary)]">Risk per Trade (%)</label>
          <input
            type="number"
            step="0.1"
            value={form.riskPercentage}
            onChange={(e) => handleChange('riskPercentage', Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-[#00140a] border border-[rgba(80,200,120,0.2)] text-xs font-mono text-white focus:outline-none focus:border-[#00ff87]"
          />
          {validation.errors.riskPercentage && (
            <span className="text-[9px] font-mono text-red-400">{validation.errors.riskPercentage}</span>
          )}
        </div>

        {/* Entry Price */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-[var(--text-secondary)]">Entry Price (₹)</label>
          <input
            type="number"
            step="0.05"
            value={form.entryPrice}
            onChange={(e) => handleChange('entryPrice', Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-[#00140a] border border-[rgba(80,200,120,0.2)] text-xs font-mono text-white focus:outline-none focus:border-[#00ff87]"
          />
        </div>

        {/* Stop Loss */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-[var(--text-secondary)]">Stop Loss (₹)</label>
          <input
            type="number"
            step="0.05"
            value={form.stopLossPrice}
            onChange={(e) => handleChange('stopLossPrice', Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-[#00140a] border border-[rgba(80,200,120,0.2)] text-xs font-mono text-red-400 focus:outline-none focus:border-red-500"
          />
          {validation.errors.stopLossPrice && (
            <span className="text-[9px] font-mono text-red-400">{validation.errors.stopLossPrice}</span>
          )}
        </div>

        {/* Profit Target */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-[var(--text-secondary)]">Profit Target (₹)</label>
          <input
            type="number"
            step="0.05"
            value={form.targetPrice}
            onChange={(e) => handleChange('targetPrice', Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-[#00140a] border border-[rgba(80,200,120,0.2)] text-xs font-mono text-[#00ff87] focus:outline-none focus:border-[#00ff87]"
          />
        </div>
      </div>

      {/* Calculated Output Summary & Execution Buttons */}
      {metrics && (
        <div className="p-4 rounded-xl bg-[#00140a]/90 border border-[rgba(80,200,120,0.18)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs flex-wrap">
            <div>
              <span className="text-[var(--text-muted)] block text-[10px]">CALCULATED SHARES</span>
              <span className="text-white font-bold text-sm">{metrics.shares} Shares</span>
              <span className="text-[10px] text-[var(--text-muted)] block">₹{metrics.totalCost.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block text-[10px]">RISK : REWARD</span>
              <span
                className={clsx('font-bold text-sm', metrics.riskRewardRatio >= 2 ? 'text-[#00ff87]' : 'text-amber-400')}
              >
                1 : {metrics.riskRewardRatio}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block text-[10px]">MAX RISK (1R)</span>
              <span className="text-red-400 font-bold text-sm">-₹{metrics.potentialLoss.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block text-[10px]">POTENTIAL RETURN</span>
              <span className="text-[#00ff87] font-bold text-sm">+₹{metrics.potentialProfit.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleExecutePaperTrade('BUY')}
              leftIcon={<TrendingUp className="w-3.5 h-3.5" />}
            >
              Paper BUY
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleExecutePaperTrade('SELL')}
              leftIcon={<TrendingDown className="w-3.5 h-3.5" />}
            >
              Paper SELL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
