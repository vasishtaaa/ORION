import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Economic Events Calendar',
  description:
    'Economic events calendar for Indian and global markets: RBI rate decisions, GDP releases, CPI data, IIP, PMI, Fed meetings, ECB announcements, and other macro events.',
  alternates: { canonical: 'https://orion.trade/economic-events' },
  openGraph: {
    title: 'Economic Events — ORION Financial Intelligence',
    description: 'RBI, GDP, CPI, Fed and global macro economic events calendar for traders.',
    url: 'https://orion.trade/economic-events',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Economic Events — ORION', description: 'Macro events calendar for markets.' },
};

export default function EconomicEventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
