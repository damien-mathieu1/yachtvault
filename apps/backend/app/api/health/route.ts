import { NextRequest, NextResponse } from 'next/server';

// Health check endpoint for the backend API
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'yacht-backend-api',
    version: '1.0.0'
  });
}
