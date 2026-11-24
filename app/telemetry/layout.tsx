import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engine Telemetry',
  description:
    'ORION WebSocket engine health metrics, packet latency histogram, throughput measurements, P50/P99 latency, and live telemetry node diagnostics for the HFT market data pipeline.',
  alternates: {
    canonical: 'https://orion.trade/telemetry',
  },
  openGraph: {
    title: 'Engine Telemetry — ORION Financial Intelligence',
    description:
      'Real-time WebSocket engine metrics: P50/P99 latency, throughput, and latency histogram for the ORION HFT pipeline.',
    url: 'https://orion.trade/telemetry',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telemetry — ORION',
    description: 'Live HFT engine metrics: latency, throughput, and diagnostics.',
  },
};

export default function TelemetryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
