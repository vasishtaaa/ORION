import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sector Performance',
  description:
    'NSE sector and industry performance heatmap: IT, Banking, Pharma, Auto, Energy, FMCG, Metals, and Realty sectors with top performers and sector-level signals.',
  alternates: { canonical: 'https://orion.trade/sectors' },
  openGraph: {
    title: 'Sector Performance — ORION Financial Intelligence',
    description: 'NSE sector heatmap and industry breakdown with top performers and AI signals.',
    url: 'https://orion.trade/sectors',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Sectors — ORION', description: 'NSE sector performance heatmap.' },
};

export default function SectorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
