import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial News Wire',
  description:
    'Live financial news aggregated from Reuters, Bloomberg, Economic Times, Mint, and Moneycontrol. Sentiment analysis, source attribution, category filters, and real-time updates for Indian and global markets.',
  alternates: {
    canonical: 'https://orion.trade/news',
  },
  openGraph: {
    title: 'Financial News Wire — ORION Financial Intelligence',
    description:
      'Real-time financial news with sentiment analysis from Reuters, Bloomberg, Economic Times, and more.',
    url: 'https://orion.trade/news',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial News — ORION',
    description: 'Live market news wire with sentiment analysis for Indian equities.',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
