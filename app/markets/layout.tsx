import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Overview',
  description:
    'Global and Indian equity market overview: NIFTY 50, SENSEX, BANK NIFTY, advance/decline ratio, breadth indicators, international indices, and sector performance.',
  alternates: { canonical: 'https://orion.trade/markets' },
  openGraph: {
    title: 'Market Overview — ORION Financial Intelligence',
    description: 'NSE/BSE market overview with indices, breadth, advance/decline, and global markets.',
    url: 'https://orion.trade/markets',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Markets — ORION', description: 'Live NSE/BSE market overview.' },
};

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
