import { NextResponse } from 'next/server';

export async function GET() {
  // Simple health check endpoint
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development'
  });
} 