import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PGlite (the in-memory fallback database) ships WASM files that must not be bundled.
  serverExternalPackages: ['@electric-sql/pglite'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  experimental: {
    // Slip and product photo uploads go through server actions (Vercel caps request bodies at 4.5 MB).
    serverActions: { bodySizeLimit: '4.5mb' },
  },
};

export default nextConfig;
