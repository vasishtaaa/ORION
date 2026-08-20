import type { Metadata } from "next";
import ClientBackgroundWrapper from "@/components/canvas/ClientBackgroundWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "VORTEX-HF | Real-Time Market Intelligence",
  description: "High-frequency telemetry engine with quantitative AI. Real-time order flow, candlestick charts, AI analyst, and market screener.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: "#000e07", minHeight: "100vh", display: "flex", flexDirection: "column" }} className="overflow-x-hidden">
        <ClientBackgroundWrapper />
        <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto p-6 min-h-0 overflow-hidden gap-6">
          {children}
        </div>
      </body>
    </html>
  );
}
