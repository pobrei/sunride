import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { envConfig } from '@/lib/env';

// In-memory store for rate limiting
// Note: This will be reset on server restart or deployment
// For production, use a persistent store like Redis
const rateLimit = new Map<string, { count: number; lastReset: number }>();

/**
 * Middleware function for rate limiting API requests
 * 
 * @param request - The incoming request
 * @returns The response or undefined to continue
 */
export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return;
  }
  
  // Get client IP
  const ip = request.ip || 'unknown';
  
  // Get rate limit configuration
  const maxRequests = envConfig.apiRateLimit;
  const windowMs = envConfig.apiRateLimitWindowMs;
  
  // Get current timestamp
  const now = Date.now();
  
  // Get or initialize rate limit data for this IP
  let rateData = rateLimit.get(ip);
  if (!rateData) {
    rateData = { count: 0, lastReset: now };
    rateLimit.set(ip, rateData);
  }
  
  // Reset count if window has passed
  if (now - rateData.lastReset > windowMs) {
    rateData.count = 0;
    rateData.lastReset = now;
  }
  
  // Increment count
  rateData.count++;
  
  // Set headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - rateData.count).toString());
  response.headers.set('X-RateLimit-Reset', (rateData.lastReset + windowMs).toString());
  
  // Check if rate limit exceeded
  if (rateData.count > maxRequests) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateData.lastReset + windowMs - now) / 1000).toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (rateData.lastReset + windowMs).toString(),
        },
      }
    );
  }
  
  return response;
}

// Configure which paths this middleware applies to
export const config = {
  matcher: '/api/:path*',
};
