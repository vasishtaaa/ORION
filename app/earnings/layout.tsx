import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Earnings Calendar',
  description:
    'NSE and BSE earnings calendar: upcoming quarterly results, EPS estimates, historical beats and misses, revenue guidance, and analyst consensus for Indian equities.',
  alternates: { canonical: 'https://orion.trade/earnings' },
  openGraph: {
    title: 'Earnings Calendar — ORION Financial Intelligence',
    description: 'Upcoming NSE/BSE earnings results, EPS estimates, and historical quarterly data.',
    url: 'https://orion.trade/earnings',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Earnings — ORION', description: 'NSE/BSE earnings calendar and results.' },
};

export default function EarningsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
