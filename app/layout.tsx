import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientBackgroundWrapper from '@/components/canvas/ClientBackgroundWrapper';
import { ToastProvider } from '@/components/ui/Toast';
import { StartupLoader } from '@/components/ui/StartupLoader';

/* ── Optimised font loading — no render-blocking @import ─────────────────── */

const SITE_URL = 'https://orion.trade';
const SITE_NAME = 'ORION Financial Intelligence';
const SITE_DESCRIPTION =
  'Institutional-grade high-frequency market telemetry and quantitative AI for NSE & BSE equity markets. Real-time screening, AI signals, live news, and order-book analytics — built for active traders and quantitative funds.';

/* ── Root metadata — applies to all pages unless overridden ──────────────── */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ORION — Institutional Market Intelligence Platform',
    template: '%s — ORION',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'ORION Financial Intelligence' }],
  generator: 'Next.js',
  keywords: [
    'stock market', 'NSE', 'BSE', 'stock screener', 'market telemetry',
    'quantitative analysis', 'trading signals', 'financial intelligence',
    'market movers', 'live charts', 'HFT', 'order book', 'AI trading',
    'Gemini AI', 'Alpha Vantage', 'Indian stock market',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'ORION — Institutional Market Intelligence Platform',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: 'ORION Financial Intelligence Platform — Market Telemetry Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORION — Institutional Market Intelligence Platform',
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.svg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon.svg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/* ── JSON-LD — WebSite + Organization (root-level, every page) ───────────── */
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/screener?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description: SITE_DESCRIPTION,
  sameAs: [],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="w-full min-h-screen text-white flex flex-col overflow-x-hidden antialiased orion-body">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#10b981] focus:text-black focus:font-bold focus:text-sm"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <StartupLoader />
          <ClientBackgroundWrapper />
          <div className="relative z-10 w-full min-h-screen flex flex-col">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
