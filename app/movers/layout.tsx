import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Movers',
  description:
    'Live NSE and BSE market movers: top gainers, top losers, and most actively traded stocks. Updated in real time from Alpha Vantage institutional data.',
  alternates: { canonical: 'https://orion.trade/movers' },
  openGraph: {
    title: 'Market Movers — ORION Financial Intelligence',
    description: 'Real-time NSE/BSE top gainers, losers, and most active stocks.',
    url: 'https://orion.trade/movers',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Market Movers — ORION', description: 'Live NSE/BSE gainers and losers.' },
};

export default function MoversLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
