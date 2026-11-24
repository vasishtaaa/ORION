'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { audio } from '@/lib/audio';

export interface PaperPosition {
  id: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  shares: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  target?: number;
  openedAt: number;
}

export interface PaperOrder {
  id: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
  shares: number;
  price: number;
  realizedPnl?: number;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  timestamp: number;
}

export interface PaperPortfolio {
  initialBalance: number;
  cash: number;
  positions: PaperPosition[];
  orderHistory: PaperOrder[];
}

const DEFAULT_PORTFOLIO: PaperPortfolio = {
  initialBalance: 1000000, // ₹10,00,000 Demo Capital
  cash: 1000000,
  positions: [],
  orderHistory: [],
};

const STORAGE_KEY = 'orion_paper_portfolio_v1';

export function usePaperTrading() {
  const [portfolio, setPortfolio] = useState<PaperPortfolio>(() => {
    if (typeof window === 'undefined') return DEFAULT_PORTFOLIO;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return DEFAULT_PORTFOLIO;
  });

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {}
  }, [portfolio]);

  // Update current prices for open positions
  const updatePrice = useCallback((ticker: string, price: number) => {
    if (!price || price <= 0) return;
    setPortfolio((prev) => {
      let changed = false;
      const updatedPositions = prev.positions.map((pos) => {
        if (pos.ticker === ticker && pos.currentPrice !== price) {
          changed = true;
          return { ...pos, currentPrice: price };
        }
        return pos;
      });
      return changed ? { ...prev, positions: updatedPositions } : prev;
    });
  }, []);

  // Place and execute an order
  const executeOrder = useCallback(
    ({
      ticker,
      side,
      shares,
      price,
      type = 'MARKET',
      stopLoss,
      target,
    }: {
      ticker: string;
      side: 'BUY' | 'SELL';
      shares: number;
      price: number;
      type?: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
      stopLoss?: number;
      target?: number;
    }): { success: boolean; message: string } => {
      if (shares <= 0 || price <= 0) {
        return { success: false, message: 'Invalid shares or execution price' };
      }

      const totalCost = shares * price;

      if (side === 'BUY' && portfolio.cash < totalCost) {
        return {
          success: false,
          message: `Insufficient capital: Available ₹${portfolio.cash.toLocaleString()}, Required ₹${totalCost.toLocaleString()}`,
        };
      }

      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const positionId = `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newOrder: PaperOrder = {
        id: orderId,
        ticker,
        side,
        type,
        shares,
        price,
        status: 'FILLED',
        timestamp: Date.now(),
      };

      setPortfolio((prev) => {
        let newCash = prev.cash;
        const newPositions = [...prev.positions];

        if (side === 'BUY') {
          newCash -= totalCost;
          // Check if existing position exists to average
          const existingIdx = newPositions.findIndex((p) => p.ticker === ticker && p.side === 'BUY');
          if (existingIdx >= 0) {
            const existing = newPositions[existingIdx];
            const combinedShares = existing.shares + shares;
            const avgEntry = (existing.shares * existing.entryPrice + totalCost) / combinedShares;
            newPositions[existingIdx] = {
              ...existing,
              shares: combinedShares,
              entryPrice: avgEntry,
              currentPrice: price,
              stopLoss: stopLoss ?? existing.stopLoss,
              target: target ?? existing.target,
            };
          } else {
            newPositions.push({
              id: positionId,
              ticker,
              side: 'BUY',
              shares,
              entryPrice: price,
              currentPrice: price,
              stopLoss,
              target,
              openedAt: Date.now(),
            });
          }
        } else {
          // SELL / SHORT or CLOSING
          // Check if there is an existing BUY position to close or reduce
          const existingIdx = newPositions.findIndex((p) => p.ticker === ticker && p.side === 'BUY');
          if (existingIdx >= 0) {
            const existing = newPositions[existingIdx];
            if (shares >= existing.shares) {
              // Close entire position
              const realizedProfit = (price - existing.entryPrice) * existing.shares;
              newCash += existing.shares * price;
              newOrder.realizedPnl = realizedProfit;
              newPositions.splice(existingIdx, 1);
            } else {
              // Partial close
              const realizedProfit = (price - existing.entryPrice) * shares;
              newCash += shares * price;
              newOrder.realizedPnl = realizedProfit;
              newPositions[existingIdx] = {
                ...existing,
                shares: existing.shares - shares,
                currentPrice: price,
              };
            }
          } else {
            // Short position or cash credit
            newCash += totalCost;
            newPositions.push({
              id: positionId,
              ticker,
              side: 'SELL',
              shares,
              entryPrice: price,
              currentPrice: price,
              stopLoss,
              target,
              openedAt: Date.now(),
            });
          }
        }

        return {
          ...prev,
          cash: newCash,
          positions: newPositions,
          orderHistory: [newOrder, ...prev.orderHistory],
        };
      });

      // Play audio notification
      audio.playOrderFill();

      return {
        success: true,
        message: `${side} filled: ${shares} ${ticker.split('_')[0]} @ ₹${price.toFixed(2)}`,
      };
    },
    [portfolio.cash]
  );

  // Close an open position directly
  const closePosition = useCallback(
    (positionId: string, executionPrice: number) => {
      setPortfolio((prev) => {
        const targetPos = prev.positions.find((p) => p.id === positionId);
        if (!targetPos) return prev;

        const pnl =
          targetPos.side === 'BUY'
            ? (executionPrice - targetPos.entryPrice) * targetPos.shares
            : (targetPos.entryPrice - executionPrice) * targetPos.shares;

        const credit =
          targetPos.side === 'BUY'
            ? targetPos.shares * executionPrice
            : targetPos.shares * targetPos.entryPrice + pnl;

        const closeOrder: PaperOrder = {
          id: `ord-close-${Date.now()}`,
          ticker: targetPos.ticker,
          side: targetPos.side === 'BUY' ? 'SELL' : 'BUY',
          type: 'MARKET',
          shares: targetPos.shares,
          price: executionPrice,
          realizedPnl: pnl,
          status: 'FILLED',
          timestamp: Date.now(),
        };

        audio.playOrderFill();

        return {
          ...prev,
          cash: prev.cash + credit,
          positions: prev.positions.filter((p) => p.id !== positionId),
          orderHistory: [closeOrder, ...prev.orderHistory],
        };
      });
    },
    []
  );

  // Reset portfolio to default
  const resetAccount = useCallback(() => {
    setPortfolio(DEFAULT_PORTFOLIO);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  // Computed metrics
  const portfolioMetrics = useMemo(() => {
    let investedCapital = 0;
    let unrealizedPnl = 0;

    portfolio.positions.forEach((pos) => {
      const positionValue = pos.shares * pos.entryPrice;
      investedCapital += positionValue;
      const posPnl =
        pos.side === 'BUY'
          ? (pos.currentPrice - pos.entryPrice) * pos.shares
          : (pos.entryPrice - pos.currentPrice) * pos.shares;
      unrealizedPnl += posPnl;
    });

    const totalEquity = portfolio.cash + investedCapital + unrealizedPnl;
    const totalReturn = totalEquity - portfolio.initialBalance;
    const totalReturnPct = (totalReturn / portfolio.initialBalance) * 100;

    const realizedPnl = portfolio.orderHistory.reduce((sum, ord) => sum + (ord.realizedPnl || 0), 0);
    const winTrades = portfolio.orderHistory.filter((ord) => ord.realizedPnl !== undefined && ord.realizedPnl > 0).length;
    const closedTrades = portfolio.orderHistory.filter((ord) => ord.realizedPnl !== undefined).length;
    const winRate = closedTrades > 0 ? (winTrades / closedTrades) * 100 : 0;

    return {
      totalEquity,
      investedCapital,
      cash: portfolio.cash,
      unrealizedPnl,
      realizedPnl,
      totalReturn,
      totalReturnPct,
      winRate,
      closedTradesCount: closedTrades,
    };
  }, [portfolio]);

  // Export trade journal to CSV
  const exportJournalCsv = useCallback(() => {
    const headers = ['Order ID', 'Ticker', 'Side', 'Type', 'Shares', 'Execution Price (INR)', 'Realized PnL (INR)', 'Timestamp'];
    const rows = portfolio.orderHistory.map((ord) => [
      ord.id,
      ord.ticker,
      ord.side,
      ord.type,
      ord.shares,
      ord.price.toFixed(2),
      ord.realizedPnl !== undefined ? ord.realizedPnl.toFixed(2) : '—',
      new Date(ord.timestamp).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ORION_Paper_Trades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [portfolio.orderHistory]);

  return {
    portfolio,
    metrics: portfolioMetrics,
    executeOrder,
    closePosition,
    updatePrice,
    resetAccount,
    exportJournalCsv,
  };
}
