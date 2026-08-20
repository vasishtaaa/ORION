'use client';
import React, { useMemo, useState, useRef } from 'react';
import { Timeframe } from '@/lib/websocket';

interface CandlestickChartProps {
  candles?: any[];
  mode?: 'candle' | 'line';
  height?: number;
  timeframe?: Timeframe;
}

interface NormalizedCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ts: string;
}

function processCandles(rawCandles: any[], tf: Timeframe = 'LIVE'): NormalizedCandle[] {
  const norm: NormalizedCandle[] = (rawCandles || []).map((c) => {
    const open = Number(c?.o ?? c?.open ?? c?.c ?? c?.close ?? 1000);
    const close = Number(c?.c ?? c?.close ?? open);
    const high = Number(c?.h ?? c?.high ?? Math.max(open, close));
    const low = Number(c?.l ?? c?.low ?? Math.min(open, close));
    const volume = Number(c?.v ?? c?.volume ?? 12500);
    const ts = String(c?.t ?? c?.ts ?? '');
    return { open, high, low, close, volume, ts };
  }).filter(c => !isNaN(c.close) && c.close > 0);

  if (tf === 'LIVE' || norm.length === 0) return norm;

  const lastClose = norm[norm.length - 1]?.close || 1000;
  const labelsMap: Record<Timeframe, string[]> = {
    'LIVE': [],
    '1D': ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
    '1W': ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    '1M': ['01/01', '01/03', '01/06', '01/09', '01/12', '01/15', '01/18', '01/21', '01/24', '01/27', '01/30'],
    '6M': ['M-6', 'M-5.5', 'M-5', 'M-4.5', 'M-4', 'M-3.5', 'M-3', 'M-2.5', 'M-2', 'M-1.5', 'M-1', 'NOW'],
    '1Y': ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  };

  const labels = labelsMap[tf] || labelsMap['1D'];
  const volFactor = tf === '1D' ? 0.003 : tf === '1W' ? 0.008 : tf === '1M' ? 0.015 : tf === '6M' ? 0.025 : 0.04;

  return labels.map((lbl, idx) => {
    const factor = 1 + (Math.sin(idx * 1.3) * 0.7 + Math.cos(idx * 0.9) * 0.3) * volFactor;
    const close = idx === labels.length - 1 ? lastClose : lastClose * factor;
    const open = close * (1 - (Math.sin(idx * 2.5) * 0.5) * volFactor);
    const high = Math.max(open, close) * (1 + Math.abs(Math.cos(idx)) * volFactor * 0.6);
    const low = Math.min(open, close) * (1 - Math.abs(Math.sin(idx)) * volFactor * 0.6);
    const volume = Math.floor(10000 + Math.abs(Math.sin(idx * 2)) * 45000);
    return { open, high, low, close, volume, ts: lbl };
  });
}

export default function CandlestickChart({
  candles = [],
  mode = 'line',
  height = 320,
  timeframe = 'LIVE',
}: CandlestickChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 800;
  const chartHeight = 320;
  const leftMargin = 80;
  const rightMargin = 75;
  const topMargin = 25;
  const bottomMargin = 45;

  const drawableWidth = width - leftMargin - rightMargin;
  const drawableHeight = chartHeight - topMargin - bottomMargin;

  const dataPoints = useMemo(() => {
    const processed = processCandles(candles, timeframe);
    if (processed && processed.length > 0) return processed;

    const base = 1148.50;
    return Array.from({ length: 30 }, (_, i) => {
      const open = base + Math.sin(i * 0.4) * 2;
      const close = base + Math.sin(i * 0.4) * 2 + Math.cos(i * 0.7);
      const high = Math.max(open, close) + 1.2;
      const low = Math.min(open, close) - 1.2;
      const volume = Math.floor(15000 + Math.cos(i) * 8000);
      return { open, high, low, close, volume, ts: `t-${i}` };
    });
  }, [candles, timeframe]);

  const { minPrice, maxPrice, priceRange, maxVol, points } = useMemo(() => {
    const prices = dataPoints.flatMap((d) => [d.low, d.high, d.open, d.close]).filter((p) => typeof p === 'number' && !isNaN(p) && p > 0);
    const vols = dataPoints.map(d => d.volume).filter(v => typeof v === 'number' && !isNaN(v));
    
    let min = prices.length > 0 ? Math.min(...prices) : 100;
    let max = prices.length > 0 ? Math.max(...prices) : 110;
    let maxV = vols.length > 0 ? Math.max(...vols) : 50000;

    if (!isFinite(min) || !isFinite(max) || min === max) {
      min = (prices[0] || 1000) * 0.98;
      max = (prices[0] || 1000) * 1.02;
    }

    const padding = (max - min) * 0.08 || 1;
    const minP = min - padding;
    const maxP = max + padding;
    const range = maxP - minP || 10;

    const pts = dataPoints.map((d, i) => {
      const xRatio = dataPoints.length > 1 ? i / (dataPoints.length - 1) : 0.5;
      const x = leftMargin + xRatio * drawableWidth;
      
      const calcY = (val: number) => {
        const yVal = topMargin + (1 - (val - minP) / range) * drawableHeight;
        return isNaN(yVal) ? topMargin + drawableHeight / 2 : yVal;
      };

      const y = calcY(d.close);
      const openY = calcY(d.open);
      const highY = calcY(d.high);
      const lowY = calcY(d.low);
      const volHeight = maxV > 0 ? (d.volume / maxV) * (drawableHeight * 0.22) : 10;

      return { x, y, openY, highY, lowY, volHeight, raw: d };
    });

    return { minPrice: minP, maxPrice: maxP, priceRange: range, maxVol: maxV, points: pts };
  }, [dataPoints, drawableWidth, drawableHeight]);

  // Compute Moving Average / VWAP curve
  const vwapPoints = useMemo(() => {
    if (points.length === 0) return '';
    let windowSize = 5;
    const vwapList: { x: number; y: number }[] = [];

    for (let i = 0; i < points.length; i++) {
      const slice = points.slice(Math.max(0, i - windowSize + 1), i + 1);
      const avgClose = slice.reduce((sum, p) => sum + p.raw.close, 0) / slice.length;
      const yVal = topMargin + (1 - (avgClose - minPrice) / priceRange) * drawableHeight;
      vwapList.push({ x: points[i].x, y: yVal });
    }

    let d = `M ${vwapList[0].x} ${vwapList[0].y}`;
    for (let i = 0; i < vwapList.length - 1; i++) {
      const curr = vwapList[i];
      const next = vwapList[i + 1];
      const cx = (curr.x + next.x) / 2;
      d += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [points, minPrice, priceRange, drawableHeight]);

  // Smooth SVG Line & Area Fill
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cx = (curr.x + next.x) / 2;
      d += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = topMargin + drawableHeight;
    const area = `${d} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { linePath: d, areaPath: area };
  }, [points, drawableHeight]);

  const yTicks = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const price = maxPrice - (i / 4) * priceRange;
      const y = topMargin + (i / 4) * drawableHeight;
      return { price, y: isNaN(y) ? topMargin + i * (drawableHeight / 4) : y };
    });
  }, [maxPrice, priceRange, drawableHeight]);

  const formatTime = (ts: string) => {
    if (!ts) return '';
    if (ts.startsWith('t-')) return ts;
    const num = Number(ts);
    if (!isNaN(num) && num > 1000000000) {
      const date = new Date(num);
      if (timeframe === 'LIVE' || timeframe === '1D') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return ts;
  };

  const candleWidth = Math.min((drawableWidth / Math.max(points.length, 1)) * 0.55, 16);
  const latestPoint = points[points.length - 1];
  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  // Mouse hover event handler for crosshair HUD
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    
    // Find closest data point
    let closestIdx = 0;
    let minDist = Infinity;
    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-2xl">
      <svg
        ref={svgRef}
        viewBox="0 0 800 320"
        className="w-full h-full overflow-hidden rounded-2xl cursor-crosshair select-none"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          {/* Neon Area Gradient */}
          <linearGradient id="vortexNeonGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00ff87" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#50C878" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#000e07" stopOpacity="0.0" />
          </linearGradient>

          {/* Candle Glow Filters */}
          <filter id="neonBullGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="neonBearGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <clipPath id="drawableClip">
            <rect x={leftMargin} y={topMargin} width={drawableWidth} height={drawableHeight} />
          </clipPath>
        </defs>

        {/* Gridlines & Y-Axis Prices */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1="80"
              y1={tick.y}
              x2={width - rightMargin}
              y2={tick.y}
              stroke="rgba(80, 200, 120, 0.08)"
              strokeDasharray="4 4"
            />
            <text
              x="22"
              y={tick.y + 3}
              textAnchor="start"
              fill="rgba(240, 255, 248, 0.50)"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
            >
              ₹{(tick.price || 0).toFixed(2)}
            </text>
          </g>
        ))}

        {/* Main Chart Graphics (Clipped to prevent spillover) */}
        <g clipPath="url(#drawableClip)">
          {/* Volumetric Histogram (Bottom 20%) */}
          {points.map((pt, i) => {
            const isBull = pt.raw.close >= pt.raw.open;
            const volColor = isBull ? 'rgba(0, 255, 135, 0.22)' : 'rgba(255, 59, 87, 0.22)';
            const yBase = topMargin + drawableHeight;
            return (
              <rect
                key={`vol-${i}`}
                x={pt.x - candleWidth / 2}
                y={yBase - pt.volHeight}
                width={candleWidth}
                height={pt.volHeight}
                fill={volColor}
                rx="1"
              />
            );
          })}

          {/* VWAP Overlay Line */}
          {vwapPoints && (
            <path
              d={vwapPoints}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity="0.75"
            />
          )}

          {/* Mode 1: Line Graph with Glow Gradient */}
          {mode === 'line' && (
            <>
              <path d={areaPath} fill="url(#vortexNeonGradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="var(--matrix-bright)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 135, 0.5))' }}
              />
            </>
          )}

          {/* Mode 2: Redesigned High-Frequency Candlesticks */}
          {mode === 'candle' &&
            points.map((pt, i) => {
              const isBull = pt.raw.close >= pt.raw.open;
              const color = isBull ? '#00ff87' : '#ff3b57';
              const bodyTop = Math.min(pt.openY, pt.y);
              const bodyHeight = Math.max(Math.abs(pt.openY - pt.y), 2.5);
              const isHovered = hoverIndex === i;

              return (
                <g key={`candle-${i}`} style={{ opacity: hoverIndex !== null && !isHovered ? 0.45 : 1 }}>
                  {/* High/Low Wick */}
                  <line
                    x1={pt.x}
                    y1={pt.highY}
                    x2={pt.x}
                    y2={pt.lowY}
                    stroke={color}
                    strokeWidth={isHovered ? '2' : '1.3'}
                  />
                  {/* Candle Body */}
                  <rect
                    x={pt.x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth="0.5"
                    rx="1.5"
                    style={{
                      filter: isBull ? 'url(#neonBullGlow)' : 'url(#neonBearGlow)',
                    }}
                  />
                </g>
              );
            })}

          {/* Latest Price Dashed Line */}
          {latestPoint && (
            <line
              x1={leftMargin}
              y1={latestPoint.y}
              x2={width - rightMargin}
              y2={latestPoint.y}
              stroke={latestPoint.raw.close >= latestPoint.raw.open ? '#00ff87' : '#ff3b57'}
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.85"
            />
          )}

          {/* Hover Crosshair Overlay */}
          {hoveredPoint && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={hoveredPoint.x}
                y1={topMargin}
                x2={hoveredPoint.x}
                y2={topMargin + drawableHeight}
                stroke="rgba(240, 255, 248, 0.45)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Horizontal Crosshair Line */}
              <line
                x1={leftMargin}
                y1={hoveredPoint.y}
                x2={width - rightMargin}
                y2={hoveredPoint.y}
                stroke="rgba(240, 255, 248, 0.45)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Pointer Circle */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="4.5"
                fill="#00ff87"
                stroke="#000e07"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 6px #00ff87)' }}
              />
            </g>
          )}
        </g>

        {/* Latest Price Badge (Right Margin) */}
        {latestPoint && (
          <g>
            <rect
              x={width - rightMargin + 6}
              y={latestPoint.y - 10}
              width="62"
              height="20"
              rx="4"
              fill={latestPoint.raw.close >= latestPoint.raw.open ? '#00ff87' : '#ff3b57'}
            />
            <text
              x={width - rightMargin + 37}
              y={latestPoint.y + 3.5}
              textAnchor="middle"
              fill="#000e07"
              fontSize="10"
              fontWeight="800"
              fontFamily="JetBrains Mono, monospace"
            >
              ₹{latestPoint.raw.close.toFixed(1)}
            </text>
          </g>
        )}

        {/* X-Axis Timestamps */}
        {points.filter((_, i) => i % Math.ceil(Math.max(points.length, 1) / 6) === 0).map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={chartHeight - 12}
            textAnchor="middle"
            fill="rgba(240, 255, 248, 0.50)"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            {formatTime(pt.raw.ts)}
          </text>
        ))}

        {/* Live HUD Tooltip Box (on Hover) */}
        {hoveredPoint && (
          <g transform={`translate(${Math.min(Math.max(hoveredPoint.x - 70, leftMargin + 10), width - rightMargin - 150)}, ${topMargin + 10})`}>
            <rect
              width="145"
              height="48"
              rx="6"
              fill="rgba(0, 14, 7, 0.95)"
              stroke="rgba(80, 200, 120, 0.4)"
              strokeWidth="1"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.8))' }}
            />
            <text x="10" y="16" fill="var(--matrix-bright)" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono, monospace">
              O: ₹{hoveredPoint.raw.open.toFixed(2)}  H: ₹{hoveredPoint.raw.high.toFixed(2)}
            </text>
            <text x="10" y="30" fill="var(--matrix-bright)" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono, monospace">
              L: ₹{hoveredPoint.raw.low.toFixed(2)}  C: ₹{hoveredPoint.raw.close.toFixed(2)}
            </text>
            <text x="10" y="42" fill="rgba(240, 255, 248, 0.5)" fontSize="8" fontFamily="JetBrains Mono, monospace">
              VOL: {(hoveredPoint.raw.volume / 1000).toFixed(1)}k · {formatTime(hoveredPoint.raw.ts)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}