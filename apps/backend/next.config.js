import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for monorepo - includes files from the monorepo base two directories up
  outputFileTracingRoot: path.join(process.cwd(), '../../'),
  // Enable standalone output for better deployment
  output: 'standalone',
  // Configure for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
