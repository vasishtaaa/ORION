'use client';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Candle } from '@/lib/types';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Layers, Eye, TrendingUp, Maximize2 } from 'lucide-react';

export type Timeframe = 'LIVE' | '1D' | '1W' | '1M' | '6M' | '1Y';

interface CandlestickChartProps {
  candles: Candle[];
  activeTicker: string;
  onTimeframeChange?: (tf: Timeframe) => void;
  currentTimeframe?: Timeframe;
}

export default function CandlestickChart({
  candles,
  activeTicker,
  onTimeframeChange,
  currentTimeframe = 'LIVE',
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const [showVolume, setShowVolume] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showSMA, setShowSMA] = useState(true);

  // Timeframe filter
  const displayCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    if (currentTimeframe === 'LIVE') return candles.slice(-50);
    if (currentTimeframe === '1D') return candles.slice(-30);
    if (currentTimeframe === '1W') return candles.slice(-20);
    return candles;
  }, [candles, currentTimeframe]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (displayCandles.length === 0) {
      ctx.fillStyle = 'rgba(80, 200, 120, 0.4)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting live tick telemetry...', width / 2, height / 2);
      return;
    }

    const padding = { top: 24, right: 65, bottom: 40, left: 16 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Calculate Price Range
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    displayCandles.forEach((c) => {
      minPrice = Math.min(minPrice, c.l);
      maxPrice = Math.max(maxPrice, c.h);
      if (c.v) maxVol = Math.max(maxVol, c.v);
    });

    const priceSpan = maxPrice - minPrice || 1;
    minPrice -= priceSpan * 0.05;
    maxPrice += priceSpan * 0.05;
    const fullRange = maxPrice - minPrice;

    const getY = (price: number) => padding.top + chartH * (1 - (price - minPrice) / fullRange);

    // 1. Grid Lines
    ctx.strokeStyle = 'rgba(80, 200, 120, 0.06)';
    ctx.lineWidth = 1;
    const numGrid = 5;
    for (let i = 0; i <= numGrid; i++) {
      const y = padding.top + (chartH / numGrid) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const priceVal = maxPrice - (fullRange / numGrid) * i;
      ctx.fillStyle = 'rgba(240, 255, 248, 0.35)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(2), width - padding.right + 8, y + 3);
    }

    const n = displayCandles.length;
    const candleW = Math.max(3, (chartW / n) * 0.7);
    const stepX = chartW / n;

    // 2. Volume Histogram Overlay
    if (showVolume && maxVol > 0) {
      const volH = chartH * 0.25;
      displayCandles.forEach((c, idx) => {
        const x = padding.left + idx * stepX + stepX / 2;
        const vHeight = ((c.v || 0) / maxVol) * volH;
        const isUp = c.c >= c.o;
        ctx.fillStyle = isUp ? 'rgba(0, 255, 135, 0.18)' : 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(x - candleW / 2, padding.top + chartH - vHeight, candleW, vHeight);
      });
    }

    // 3. VWAP Overlay Line
    if (showVWAP) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      let cumPV = 0;
      let cumV = 0;
      displayCandles.forEach((c, idx) => {
        const x = padding.left + idx * stepX + stepX / 2;
        const vol = c.v || 1000;
        const typical = (c.h + c.l + c.c) / 3;
        cumPV += typical * vol;
        cumV += vol;
        const vwap = cumPV / cumV;
        const y = getY(vwap);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. SMA 20 Overlay Line
    if (showSMA && n >= 5) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx.lineWidth = 1.5;
      const period = Math.min(10, Math.floor(n / 2));
      let started = false;

      for (let i = period - 1; i < n; i++) {
        const subset = displayCandles.slice(i - period + 1, i + 1);
        const avg = subset.reduce((acc, curr) => acc + curr.c, 0) / period;
        const x = padding.left + i * stepX + stepX / 2;
        const y = getY(avg);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // 5. Candlesticks (Wick & Real Body)
    displayCandles.forEach((c, idx) => {
      const x = padding.left + idx * stepX + stepX / 2;
      const isUp = c.c >= c.o;
      const col = isUp ? '#00ff87' : '#ef4444';
      const fillCol = isUp ? 'rgba(0, 255, 135, 0.85)' : 'rgba(239, 68, 68, 0.85)';

      const yOpen = getY(c.o);
      const yClose = getY(c.c);
      const yHigh = getY(c.h);
      const yLow = getY(c.l);

      // Wick
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      const topY = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillStyle = fillCol;
      ctx.fillRect(x - candleW / 2, topY, candleW, bodyH);

      // Border
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleW / 2, topY, candleW, bodyH);
    });

    // 6. Latest Price Pinned Beacon
    const latest = displayCandles[displayCandles.length - 1];
    if (latest) {
      const latestY = getY(latest.c);
      const isUp = latest.c >= latest.o;
      const col = isUp ? '#00ff87' : '#ef4444';

      ctx.beginPath();
      ctx.strokeStyle = `${col}66`;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(padding.left, latestY);
      ctx.lineTo(width - padding.right, latestY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.roundRect(width - padding.right + 2, latestY - 10, 58, 20, 4);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(latest.c.toFixed(2), width - padding.right + 31, latestY + 4);
    }

    // 7. Interactive Crosshair Tracking
    if (mousePos && mousePos.x >= padding.left && mousePos.x <= width - padding.right) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(240, 255, 248, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);

      // Vertical line
      ctx.moveTo(mousePos.x, padding.top);
      ctx.lineTo(mousePos.x, padding.top + chartH);

      // Horizontal line
      ctx.moveTo(padding.left, mousePos.y);
      ctx.lineTo(width - padding.right, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis hover tag
      const hoverPrice = maxPrice - ((mousePos.y - padding.top) / chartH) * fullRange;
      ctx.fillStyle = '#002b18';
      ctx.fillRect(width - padding.right + 2, mousePos.y - 9, 58, 18);
      ctx.strokeStyle = '#50C878';
      ctx.strokeRect(width - padding.right + 2, mousePos.y - 9, 58, 18);

      ctx.fillStyle = '#00ff87';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hoverPrice.toFixed(2), width - padding.right + 31, mousePos.y + 4);
    }
  }, [displayCandles, showVolume, showVWAP, showSMA, mousePos]);

  // Mouse Move Handler for Tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || displayCandles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const paddingLeft = 16;
    const paddingRight = 65;
    const chartW = rect.width - paddingLeft - paddingRight;
    const stepX = chartW / displayCandles.length;

    const idx = Math.floor((x - paddingLeft) / stepX);
    if (idx >= 0 && idx < displayCandles.length) {
      setHoveredCandle(displayCandles[idx]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  const activeCandle = hoveredCandle || displayCandles[displayCandles.length - 1];

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full min-h-[420px] relative">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(80,200,120,0.12)] px-1">
        {/* Active Candle HUD */}
        {activeCandle ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-xs">
            <span className="text-white font-bold tracking-wider">{activeTicker}</span>
            <span className="text-[var(--text-muted)]">O: <span className="text-[#f0fff8] font-semibold">{activeCandle.o.toFixed(2)}</span></span>
            <span className="text-[var(--text-muted)]">H: <span className="text-[#00ff87] font-semibold">{activeCandle.h.toFixed(2)}</span></span>
            <span className="text-[var(--text-muted)]">L: <span className="text-red-400 font-semibold">{activeCandle.l.toFixed(2)}</span></span>
            <span className="text-[var(--text-muted)]">C: <span className="text-[#f0fff8] font-bold">{activeCandle.c.toFixed(2)}</span></span>
            {activeCandle.v && (
              <span className="text-[var(--text-muted)] hidden md:inline">Vol: <span className="text-cyan-300 font-semibold">{activeCandle.v.toLocaleString()}</span></span>
            )}
          </div>
        ) : (
          <div className="text-xs font-mono text-[var(--text-muted)]">Live Order Flow Chart</div>
        )}

        {/* Timeframe & Overlay Toggles */}
        <div className="flex items-center gap-2">
          {/* Overlay Toggles */}
          <div className="hidden sm:flex items-center gap-1 bg-[#00140a] p-0.5 rounded-lg border border-[rgba(80,200,120,0.15)] text-[10px] font-mono">
            <button
              onClick={() => setShowVWAP(!showVWAP)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${showVWAP ? 'bg-cyan-950/80 text-cyan-300 font-bold' : 'text-[var(--text-muted)] hover:text-white'}`}
            >
              VWAP
            </button>
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${showSMA ? 'bg-yellow-950/80 text-yellow-300 font-bold' : 'text-[var(--text-muted)] hover:text-white'}`}
            >
              SMA
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${showVolume ? 'bg-emerald-950/80 text-[#00ff87] font-bold' : 'text-[var(--text-muted)] hover:text-white'}`}
            >
              VOL
            </button>
          </div>

          {/* Timeframe Switcher */}
          <SegmentedControl<Timeframe>
            size="sm"
            value={currentTimeframe}
            onChange={(tf) => onTimeframeChange && onTimeframeChange(tf)}
            options={[
              { label: 'LIVE', value: 'LIVE' },
              { label: '1D', value: '1D' },
              { label: '1W', value: '1W' },
              { label: '1M', value: '1M' },
            ]}
          />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full min-h-[360px] mt-2">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block cursor-crosshair"
        />
      </div>
    </div>
  );
}
