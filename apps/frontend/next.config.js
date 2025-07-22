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
    domains: ['photos.superyachtapi.com', 'superyachtfan.com', 'www.superyachtfan.com'],
  },

  typescript: {
    ignoreBuildErrors: true,
  },


  // Configure for monorepo - includes files from the monorepo base two directories up
  outputFileTracingRoot: path.join(process.cwd(), '../../'),
  // Enable standalone output for better deployment
  output: 'standalone',
};

export default withPWA(nextConfig);
