import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Dashboard',
  description:
    'ORION market command center: live NSE/BSE index status, sector heatmap, AI signal summary, market movers, FX rates, and financial news at a glance.',
  alternates: { canonical: 'https://orion.trade/dashboard' },
  openGraph: {
    title: 'Market Dashboard — ORION Financial Intelligence',
    description: 'Central market command center with live indices, sector heatmap, AI signals, and movers.',
    url: 'https://orion.trade/dashboard',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Dashboard — ORION', description: 'Live market command center.' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
