import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watchlist',
  description:
    'Personalised stock watchlist: track NSE and BSE equities, monitor price changes, AI signals, and alerts. Saved locally in your browser — no account required.',
  alternates: { canonical: 'https://orion.trade/watchlist' },
  openGraph: {
    title: 'Watchlist — ORION Financial Intelligence',
    description: 'Track your NSE/BSE stocks with price alerts, AI signals, and real-time updates.',
    url: 'https://orion.trade/watchlist',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Watchlist — ORION', description: 'Personalised NSE/BSE stock watchlist.' },
};

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
