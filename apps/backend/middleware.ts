import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000', // Development
  'https://yachtvault.vercel.app' // Production Frontend
];

// Dynamically add Vercel preview URLs
if (process.env.VERCEL_URL) {
  // VERCEL_URL is the canonical URL of the deployment, includes branch URLs like "yachtvault-git-dev-damien-jar.vercel.app"
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const requestHeaders = new Headers(request.headers);

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    // Use .some() for more flexible matching, e.g., for preview URLs
    if (origin && allowedOrigins.some(allowed => origin.endsWith(allowed))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    return response;
  }

  // Handle main requests
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (origin && allowedOrigins.some(allowed => origin.endsWith(allowed))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
