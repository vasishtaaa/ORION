import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Quantitative Analyst',
  description:
    'Gemini-powered quantitative analyst for NSE and BSE equities. Deep-dive analysis with preset sector baskets, AI-generated trade rationale, risk sizing, and position calculators.',
  alternates: {
    canonical: 'https://orion.trade/analyst',
  },
  openGraph: {
    title: 'AI Quantitative Analyst — ORION Financial Intelligence',
    description:
      'Gemini AI-powered quantitative analysis, trade rationale, and risk position sizing for Indian equities.',
    url: 'https://orion.trade/analyst',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Analyst — ORION',
    description: 'Gemini-powered trade analysis and position sizing for NSE/BSE.',
  },
};

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
