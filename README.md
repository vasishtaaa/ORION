# 🌌 O.R.I.O.N.
### Institutional-Grade High-Frequency Telemetry & Quantitative AI Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Research-emerald?style=for-the-badge)](./README.md)

**O.R.I.O.N.** (*Optimal Real-time Ingestion & Order-book Network*) is an institutional-grade financial intelligence and algorithmic trading desk engineered for the National Stock Exchange of India (**NSE**) and Bombay Stock Exchange (**BSE**). 

Combining a multi-threaded Python telemetry server, sub-millisecond WebSocket data broadcasting, algorithmic pattern scanners, an options derivatives hub, and an autonomous voice-operated quantitative intelligence assistant (**O.R.I.O.N.**), the platform delivers institutional execution capabilities directly to the local desktop.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Features & Modules](#-key-features--modules)
  - [1. Decongested Trading Desk](#1-decongested-trading-desk)
  - [2. O.R.I.O.N. Holographic Voice AI Assistant](#2-orion-holographic-voice-ai-assistant)
  - [3. Algorithmic Pattern Scanners](#3-algorithmic-pattern-scanners)
  - [4. Paper Trading Simulation Engine](#4-paper-trading-simulation-engine)
  - [5. Derivatives & NSE Options Chain Hub](#5-derivatives--nse-options-chain-hub)
  - [6. Quantitative Strategy Backtester](#6-quantitative-strategy-backtester)
  - [7. Institutional Flows & Cross-Asset Correlation](#7-institutional-flows--cross-asset-correlation)
  - [8. Acoustic Audio Engine & Sonification Pulse](#8-acoustic-audio-engine--sonification-pulse)
- [Project Directory Layout](#-project-directory-layout)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [One-Click Native Launcher](#one-click-native-launcher-recommended)
  - [CLI Flags & Options](#cli-flags--options)
  - [Manual Installation](#manual-installation)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Global Keyboard Shortcuts](#-global-keyboard-shortcuts)
- [Quality Assurance & Verification](#-quality-assurance--verification)
- [Data Notice & Disclaimer](#-data-notice--disclaimer)

---

## 🏛 Architectural Overview

```
                      ┌──────────────────────────────────────────────┐
                      │             LIVE MARKET DATA FEEDS           │
                      │  Google Finance Ingestion + Alpha Vantage    │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │        ORION-HF TELEMETRY ENGINE             │
                      │               (engine.py)                    │
                      │  - L2 Order Book Simulation & Depth Engine   │
                      │  - 42+ Active NSE/BSE Ticker Buffers         │
                      │  - Multi-threaded Ingestion & Poller Threads │
                      └──────────────┬────────────────┬──────────────┘
                                     │                │
            Port 8000 (HTTP/REST)    │                │  Port 8001 (WebSocket)
            Static Assets & APIs     │                │  Sub-ms High-Frequency Feed
                                     ▼                ▼
                      ┌──────────────────────────────────────────────┐
                      │          ORION FRONTEND CLIENT               │
                      │  Next.js 16 (App Router) + React 19 + Turbopack│
                      │                                              │
                      │  ├── Centered Hero Candlestick Chart (Canvas)│
                      │  ├── Dockable Indicator & Thesis Trays       │
                      │  ├── Full-Screen Workspace Analytics         │
                      │  └── Holographic Voice AI Orb (O.R.I.O.N.)   │
                      └──────────────────────────────────────────────┘
```

---

## 🚀 Key Features & Modules

### 1. Decongested Trading Desk
- **Clean Hero Canvas**: Centered interactive candlestick chart with configurable exponential moving averages (**EMA 20/50**), **Bollinger Bands**, and high-resolution crosshairs.
- **Canvas Technical Drawing Kit**: Draw trendlines, horizontal support/resistance rays, and Fibonacci retracement ladders directly on live candle bars.
- **Dockable Drawer Tray**: Tabbed bottom drawer accommodating:
  - **RSI Sub-Chart**: Dynamic 14-period Relative Strength Index with 70/30 overbought/oversold boundaries.
  - **AI Dual-Perspective Thesis**: Balanced bull vs. bear arguments, risk assessments, and target prices.
  - **Position Sizing Calculator**: Automatic lot sizing based on portfolio risk tolerance and stop-loss distance.
  - **Active Paper Holdings**: Live position tracking with mark-to-market P&L.
- **Collapsible Inspector Sidebar**: Real-time Level-2 market depth (Bids/Asks with depth bars), valuation multiples (P/E, D/E, Market Cap, ROE), and model parameters.

### 2. O.R.I.O.N. Holographic Voice AI Assistant
- **Hands-Free Quantitative Operations**: Floating 3D holographic orb HUD powered by the Web Speech API (SpeechRecognition & SpeechSynthesis calibrated to British English).
- **Global Activation**: Click the orb in the bottom-right corner or hit **`Alt + O`** from anywhere on the platform.
- **Natural Language Intent Parsing**:
  - *"Analyze Reliance Industries"* $\rightarrow$ Synthesizes technical and fundamental AI brief.
  - *"Buy 50 shares of TCS at market"* $\rightarrow$ Transacts via the Paper Trading desk.
  - *"Show Options Chain"* $\rightarrow$ Opens the full-screen derivatives terminal.
  - *"Switch to INFY"* $\rightarrow$ Updates telemetry, charts, and depth monitors.

### 3. Algorithmic Pattern Scanners
- Built-in recognition engine (`lib/chartPatterns.ts`) analyzing candle geometry and volume anomalies in real time:
  - **Double Bottom (W-Base)**: Bullish reversal indicator with measured target projection.
  - **Double Top (M-Ceiling)**: Bearish exhaustion and distribution pattern.
  - **Bullish / Bearish Engulfing**: Momentum shifts at key support and resistance zones.
  - **Hammer & Inverted Hammer**: Intraday liquidity absorption signals.
  - **Volatility Breakouts**: Range-expansion candles piercing outer Bollinger Bands on above-average volume.

### 4. Paper Trading Simulation Engine
- **Risk-Free Simulation Desk**: Execute trades with ₹10,00,000 of simulated starting capital.
- **Execution Capabilities**: Instant Market Orders, Limit Orders, Stop-Loss triggers, and position liquidations.
- **Mark-to-Market Accounting**: Real-time portfolio valuation tied directly to the live Level-2 WebSocket tick feed.
- **Audit & Export**: Full trade journal with order timestamps, fill prices, executed quantities, and one-click **CSV export** (`lib/export.ts`).

### 5. Derivatives & NSE Options Chain Hub
- **Options Strike Ladder**: Complete matrix of Call (CE) and Put (PE) contracts organized by strike prices.
- **Derivative Analytics**: Open Interest (OI), Intraday OI Change, Volume, and Implied Volatility.
- **Put-Call Ratio (PCR)**: Live sentiment meter identifying overextended or oversold market positioning.
- **Max Pain Theory**: Dynamic calculation of the strike price where option sellers face minimal payout.

### 6. Quantitative Strategy Backtester
- **Client-Side Algorithmic Engine** (`lib/backtester.ts`): Backtest strategies against historical candle data without external dependencies.
- **Built-in Strategies**:
  - *RSI Mean Reversion* (Oversold < 30, Overbought > 70)
  - *Dual EMA Crossover* (Fast EMA 9 crossing Slow EMA 21)
  - *VWAP Intraday Pullback* (Reversion to Volume-Weighted Average Price)
  - *Bollinger Band Mean Reversion* (Band extremes with volatility filters)
- **Institutional Metrics**: Win Rate %, Profit Factor, Maximum Drawdown, Sharpe Ratio, Total Trades, and interactive SVG equity growth curves.

### 7. Institutional Flows & Cross-Asset Correlation
- **FII / DII Institutional Tracker**: Real-time monitoring of Foreign Institutional Investors (FII) and Domestic Institutional Investors (DII) cash market buy/sell figures and block deal prints.
- **Correlation Matrix**: Real-time pairwise Pearson correlation coefficients across major benchmark constituents (RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN).
- **Sector Heatmaps**: Real-time relative strength rankings across Nifty IT, Nifty Bank, Nifty Auto, Nifty Energy, and Nifty Pharma.

### 8. Acoustic Audio Engine & Sonification Pulse
- **Acoustic Synthesizer** (`lib/audio.ts`): Web Audio API sound generator with zero external audio assets.
- **Curated Soundscapes**:
  - *Studio Clean* — Minimalist harmonic chimes.
  - *Bloomberg Modern* — Crisp institutional desktop clicks.
  - *Cyberpunk Pulse* — Deep sub-bass resonance and synthesized alerts.
- **Audio Pulse**: Real-time auditory heartbeat synchronized to incoming market volatility and order fill alerts.

---

## 📂 Project Directory Layout

```
ORION/
├── app/                          # Next.js App Router
│   ├── analyst/                  # AI Analyst & Deep Research Hub
│   ├── dashboard/                # Macro Overview & Market Pulse
│   ├── earnings/                 # Corporate Earnings Calendar
│   ├── economic-events/          # Macroeconomic Releases (RBI, CPI, GDP)
│   ├── markets/                  # Market Breadth & Adv/Dec Ratios
│   ├── movers/                   # Top Gainers, Losers, and Volume Shockers
│   ├── news/                     # Real-Time Financial News Feeds
│   ├── screener/                 # Quantitative Stock Screener
│   ├── sectors/                  # Sector Rotation & Performance
│   ├── stocks/                   # Individual Stock Deep Dive
│   ├── telemetry/                # High-Frequency Engine Telemetry Monitor
│   ├── terminal/                 # Central Trading Desk & Execution Canvas
│   ├── watchlist/                # Custom User Watchlists & Price Alerts
│   └── page.tsx                  # Landing Page & Executive Summary
├── components/                   # Modular React UI Components
│   ├── charts/                   # Candlestick, Drawing Canvas, Indicators
│   ├── layout/                   # Header, Navigation Mega-Menu, Footer
│   ├── orion/                    # Holographic Voice Orb & HUD Elements
│   ├── terminal/                 # Options Chain, Backtester, Paper Desk, Thesis
│   └── ui/                       # Reusable Glassmorphism Cards, Buttons, Modals
├── lib/                          # Core Algorithmic & Utility Libraries
│   ├── aiReasoning.ts            # Bull/Bear Matrix & Reasoning Engine
│   ├── audio.ts                  # Web Audio Acoustic Engine & Pulse
│   ├── backtester.ts             # Quantitative Backtesting Algorithms
│   ├── chartPatterns.ts          # Algorithmic Candlestick Pattern Recognition
│   ├── export.ts                 # CSV / JSON Data Exporters
│   ├── motion.ts                 # GSAP & Framer Motion Animation Helpers
│   ├── orionVoice.ts             # O.R.I.O.N. Speech Recognition & Synthesis
│   ├── types.ts                  # TypeScript Domain & Telemetry Types
│   ├── usePaperTrading.ts        # Paper Trading Portfolio Hook & State
│   └── websocket.ts              # Resilient Auto-Reconnecting WebSocket Client
├── public/                       # Static Branding, Icons & Manifest
├── agent.py                      # Autonomous VORTEX AI Python Agent
├── engine.py                     # High-Frequency Telemetry & WebSocket Engine
├── start_orion.bat               # Windows Batch Automated Launcher
├── start_orion.ps1               # Windows PowerShell Automated Launcher
└── requirements.txt              # Python Dependencies
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python**: Version `3.10` or higher (ensure Python is added to your system `PATH`).
- **Node.js**: Version `18.x` or higher (with `npm`).
- **OS**: Windows 10/11 (fully supported with native batch/PowerShell launchers; also runs on macOS/Linux via standard terminal commands).

---

### One-Click Native Launcher (Recommended)

ORION includes an intelligent, zero-friction automated launcher that inspects your runtime, handles dependency installations, detects frontend source changes, compiles the Next.js static export into `./out`, clears lingering port collisions, and boots all services:

#### Via Command Prompt (CMD):
```cmd
start_orion.bat
```

#### Via Windows PowerShell:
```powershell
.\start_orion.ps1
```

Once initialized, ORION automatically launches in your default browser at:
👉 **`http://localhost:8000/terminal`** (Trading Desk)  
👉 **`http://localhost:8000`** (Macro Dashboard)

---

### CLI Flags & Options

The launcher supports several operational flags for custom workflows:

| Flag | Description |
| :--- | :--- |
| `--build` or `-b` | Force a Next.js production rebuild to apply recent code changes. |
| `--clean` or `-c` | Purge `.next` and `out` build caches prior to compilation. |
| `--install` or `-i` | Force re-installation of both Python (`requirements.txt`) and Node.js (`package.json`) packages. |
| `--dev` or `-d` | Start Next.js in hot-reloading development mode (`localhost:3000`) alongside the backend engine. |
| `--no-browser` or `-n`| Suppress automatically opening the web browser on launch. |
| `--kill` or `-k` | Force kill any lingering processes holding ports `8000` or `8001`. |

*Example:*
```powershell
.\start_orion.ps1 -Clean -Build
```

---

### Manual Installation

If you prefer to configure and run the services manually:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ORION.git
cd ORION

# 2. Configure environment variables
cp .env.example .env

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Install Node.js dependencies
npm install

# 5. Build the production static assets
npm run build

# 6. Launch the unified engine
python engine.py
```

---

## ⚙ Configuration & Environment Variables

Copy `.env.example` to `.env` in the repository root:

```env
# Optional external market data & AI provider keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Network Binding (Defaults to localhost for security)
ORION_HOST=127.0.0.1
PORT=8000
WS_PORT=8001

# Allowed Origins (CORS protection)
ORION_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

> **Note on AI Providers:** O.R.I.O.N. is designed to operate locally without external API dependencies. If an Ollama daemon is running locally with `deepseek-r1:8b`, the engine automatically leverages it for deep reasoning. If a `GEMINI_API_KEY` is present, it can be used for supplemental cloud intelligence.

---

## ⌨ Global Keyboard Shortcuts

| Shortcut | Action | Scope |
| :---: | :--- | :--- |
| **`Alt + O`** | **Activate O.R.I.O.N. Voice AI Assistant** | Global |
| **`Space`** or **`/`** | Open Command Palette / Ticker Search | Global |
| **`B`** | Trigger Instant Market Buy (Paper Desk) | Terminal |
| **`S`** | Trigger Instant Market Sell (Paper Desk) | Terminal |
| **`1` - `5`** | Switch Chart Timeframes (1m, 5m, 15m, 1h, 1D) | Terminal |
| **`Esc`** | Close Modals / Deactivate Voice Listening | Global |
| **`?`** | Display Keyboard Shortcuts Cheat Sheet | Global |

---

## 🧪 Quality Assurance & Verification

To verify TypeScript contracts and run ESLint checks across the codebase:

```bash
# Type check all files
npx tsc --noEmit

# Lint codebase
npm run lint

# Compile production bundle
npm run build
```

---

## ⚠️ Data Notice & Disclaimer

> **FOR RESEARCH, EDUCATIONAL, AND QUANTITATIVE PURPOSES ONLY.**  
> Real-time and delayed market quotes are fetched from public financial endpoints and simulated order books. Third-party data feeds may be subject to latency, throttling, or interruption. When the live stream is disconnected, the engine seamlessly displays calibrated synthetic ticks to maintain UI functionality.
>
> **Nothing contained within this software constitutes financial, investment, legal, or tax advice.** Always consult with a certified financial advisor before executing trades in live markets.

---

<p align="center">
  <b>Designed & Engineered for High-Performance Quantitative Intelligence.</b><br>
  <sub>Copyright &copy; 2026 O.R.I.O.N. Financial Intelligence. All Rights Reserved.</sub>
</p>
