import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['photos.superyachtapi.com'],
  },


  // Configure for monorepo - includes files from the monorepo base two directories up
  outputFileTracingRoot: path.join(process.cwd(), '../../'),
  // Enable standalone output for better deployment
  output: 'standalone',
};

export default nextConfig;
