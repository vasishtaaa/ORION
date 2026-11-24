import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Market Terminal',
  description:
    'High-frequency order flow terminal with real-time candlestick charts, Level 2 order book depth, VWAP/SMA overlays, and Gemini AI trade signal generation for NSE and BSE equities.',
  alternates: {
    canonical: 'https://orion.trade/terminal',
  },
  openGraph: {
    title: 'Live Market Terminal — ORION Financial Intelligence',
    description:
      'HFT order flow terminal with L2 order book, real-time charts, VWAP/SMA, and AI signals for NSE/BSE.',
    url: 'https://orion.trade/terminal',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Terminal — ORION',
    description: 'Real-time HFT order flow terminal for NSE/BSE equities.',
  },
};

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
