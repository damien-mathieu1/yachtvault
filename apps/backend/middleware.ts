import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000',
  // Vercel preview deployments
  `https://${process.env.VERCEL_BRANCH_URL}`,
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const requestHeaders = new Headers(request.headers);

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    return response;
  }

  // Handle main requests
  const response = NextResponse.next({ request: { headers: requestHeaders }});

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
