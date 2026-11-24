import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Screener',
  description:
    'Multi-factor technical stock screener for NSE and BSE equities. Filter by RSI, quant score, AI signal, market cap, P/E ratio, EPS, volume, sector, and more. Sort, save, and export screening results.',
  alternates: {
    canonical: 'https://orion.trade/screener',
  },
  openGraph: {
    title: 'Stock Screener — ORION Financial Intelligence',
    description:
      'Multi-factor technical screening across 40+ NSE/BSE instruments with AI signals, RSI, quant scores, and institutional data.',
    url: 'https://orion.trade/screener',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Screener — ORION',
    description: 'Multi-factor NSE/BSE equity screener with AI signals and quant scores.',
  },
};

export default function ScreenerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
