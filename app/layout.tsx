import type { Metadata } from 'next';
import './globals.css';
import ClientBackgroundWrapper from '@/components/canvas/ClientBackgroundWrapper';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'ORION | High-Frequency Market Telemetry & Quantitative AI',
  description: 'Institutional-Grade High-Frequency Market Telemetry & Quantitative AI Engine powered by Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="w-full min-h-screen bg-[#080b11] text-white flex flex-col items-center overflow-x-hidden antialiased">
        <ToastProvider>
          <ClientBackgroundWrapper />
          <div className="relative z-10 w-full min-h-screen flex flex-col items-center">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
