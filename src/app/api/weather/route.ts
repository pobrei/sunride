import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForecast, getMultipleForecastPoints } from '@/lib/weatherAPI';
import type { ForecastPoint } from '@/lib/weatherAPI';

// Simple in-memory rate limiter
interface RateLimitEntry {
  timestamp: number;
  count: number;
}

const rateLimits = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '60', 10); // 60 requests per minute

// Check if a request exceeds rate limits
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  
  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    // Reset or create new entry
    rateLimits.set(ip, { timestamp: now, count: 1 });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }
  
  // Increment counter
  entry.count++;
  rateLimits.set(ip, entry);
  return true;
}

// Validate forecast point
function validatePoint(point: any): boolean {
  return (
    point && 
    typeof point.lat === 'number' && 
    typeof point.lon === 'number' && 
    typeof point.timestamp === 'number' && 
    typeof point.distance === 'number' &&
    point.lat >= -90 && point.lat <= 90 &&
    point.lon >= -180 && point.lon <= 180
  );
}

// Error handling wrapper for API routes
async function apiHandler<T>(
  req: NextRequest,
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Rate limit exceeded. Please try again later.' 
        },
        { status: 429 }
      );
    }
    
    // Execute the handler function
    const result = await handler();
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: unknown) {
    console.error('API error:', error);
    
    // Format the error response
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Determine appropriate status code based on error message
      if (errorMessage.includes('validation') || errorMessage.includes('Invalid')) {
        statusCode = 400;
      } else if (errorMessage.includes('not found') || errorMessage.includes('No data')) {
        statusCode = 404;
      } else if (errorMessage.includes('Rate limit')) {
        statusCode = 429;
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: statusCode }
    );
  }
}

export async function POST(req: NextRequest) {
  return apiHandler(req, async () => {
    const data = await req.json();
    
    // Make sure we have valid points
    if (!data.points || !Array.isArray(data.points) || data.points.length === 0) {
      throw new Error('Invalid request. Points array is required.');
    }
    
    // Maximum batch size to prevent abuse
    if (data.points.length > 100) {
      throw new Error('Too many points requested. Maximum batch size is 100 points.');
    }
    
    // Validate each point
    const forecastPoints = data.points as ForecastPoint[];
    for (const point of forecastPoints) {
      if (!validatePoint(point)) {
        throw new Error('Invalid point data. Each point must have lat, lon, timestamp, and distance as numbers within valid ranges.');
      }
    }
    
    // Get weather data for all points
    const weatherData = await getMultipleForecastPoints(forecastPoints);
    
    // Check if we got any valid data
    const hasValidData = weatherData.some(point => point !== null);
    if (!hasValidData) {
      throw new Error('No weather data could be retrieved for the provided points.');
    }
    
    return weatherData;
  });
}

export async function GET(req: NextRequest) {
  return apiHandler(req, async () => {
    const searchParams = req.nextUrl.searchParams;
    
    // Validate required parameters
    if (!searchParams.has('lat') || !searchParams.has('lon') || 
        !searchParams.has('timestamp') || !searchParams.has('distance')) {
      throw new Error('Missing required parameters. lat, lon, timestamp, and distance are required.');
    }
    
    // Parse and validate parameters
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    const timestamp = parseInt(searchParams.get('timestamp') || '', 10);
    const distance = parseFloat(searchParams.get('distance') || '');
    
    if (isNaN(lat) || isNaN(lon) || isNaN(timestamp) || isNaN(distance)) {
      throw new Error('Invalid parameters. lat, lon, timestamp, and distance must be numbers.');
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
    }
    
    // Get weather data for this point
    const point: ForecastPoint = { lat, lon, timestamp, distance };
    const weatherData = await getWeatherForecast(point);
    
    if (!weatherData) {
      throw new Error('Failed to fetch weather data for the given point.');
    }
    
    return weatherData;
  });
} 