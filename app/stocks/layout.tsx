import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stocks',
  description:
    'Browse and analyse NSE and BSE listed stocks. Access price data, fundamentals, technical indicators, AI signals, and news for individual equities tracked by ORION.',
  alternates: { canonical: 'https://orion.trade/stocks' },
  openGraph: {
    title: 'Stocks — ORION Financial Intelligence',
    description: 'Individual NSE/BSE stock analysis with fundamentals, charts, and AI signals.',
    url: 'https://orion.trade/stocks',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Stocks — ORION', description: 'NSE/BSE stock analysis hub.' },
};

export default function StocksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
