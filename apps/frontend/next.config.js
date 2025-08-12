import path from 'path';
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['photos.superyachtapi.com', 'superyachtfan.com', 'www.superyachtfan.com'],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure for monorepo - includes files from the monorepo base two directories up
  outputFileTracingRoot: path.join(process.cwd(), '../../'),
  // Enable standalone output for better deployment
  output: 'standalone',

  // PostHog rewrites to proxy analytic requests
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://eu.i.posthog.com/decide',
      },
    ];
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default withPWA(nextConfig);