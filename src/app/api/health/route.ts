import { NextResponse } from 'next/server';
import { envConfig } from '@/lib/env';

export async function GET() {
  // Simple health check endpoint
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: envConfig.nodeEnv,
  });
}
