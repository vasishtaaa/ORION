import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['three'],
  turbopack: {
    root: __dirname,
  },
  // Disable source maps in production — reduces bundle exposure
  productionBrowserSourceMaps: false,
  // Compiler options: strip console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
};

export default nextConfig;
