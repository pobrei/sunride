import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForecast, getMultipleForecastPoints } from '@/lib/weatherAPI';
import type { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { ApiResponse, WeatherApiRequest, WeatherApiResponse } from '@/types/api-types';

// Simple in-memory rate limiter
interface RateLimitEntry {
  timestamp: number;
  count: number;
}

const rateLimits: Map<string, RateLimitEntry> = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW: number = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // 1 minute
const RATE_LIMIT_MAX: number = parseInt(process.env.RATE_LIMIT_MAX || '60', 10); // 60 requests per minute

/**
 * Check if a request exceeds rate limits
 * @param ip - The IP address to check
 * @returns True if the request is within rate limits, false otherwise
 */
function checkRateLimit(ip: string): boolean {
  const now: number = Date.now();
  const entry: RateLimitEntry | undefined = rateLimits.get(ip);

  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    // Reset or create new entry
    rateLimits.set(ip, { timestamp: now, count: 1 });
    return true;
  }

  // Increment count and check if it exceeds the limit
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return false;
  }

  // Update the entry
  rateLimits.set(ip, entry);
  return true;
}

/**
 * Validate a forecast point
 * @param point - The point to validate
 * @returns True if the point is valid, false otherwise
 */
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

/**
 * Error handling wrapper for API routes
 * @param req - The Next.js request object
 * @param handler - The handler function to execute
 * @returns Next.js response object
 */
async function apiHandler<T extends ApiResponse<unknown>>(
  req: NextRequest,
  handler: () => Promise<T>
): Promise<NextResponse<T>> {
  try {
    // Get client IP for rate limiting
    const clientIp: string = req.headers.get('x-forwarded-for') ||
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

    // Execute the handler
    const result: T = await handler();
    return NextResponse.json(result);
  } catch (error: unknown) {
    // Default error response
    let statusCode: number = 500;
    let errorMessage: string = 'An unexpected error occurred';

    // Handle known error types
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

/**
 * POST handler for batch weather data requests
 * @param req - The Next.js request object
 * @returns API response with weather data for multiple points
 */
export async function POST(req: NextRequest): Promise<NextResponse<WeatherApiResponse>> {
  return apiHandler(req, async () => {
    const data = await req.json() as WeatherApiRequest;

    // Make sure we have valid points
    if (!data.points || !Array.isArray(data.points) || data.points.length === 0) {
      throw new Error('Invalid request. Points array is required.');
    }

    // Maximum batch size to prevent abuse
    if (data.points.length > 100) {
      throw new Error('Too many points requested. Maximum batch size is 100 points.');
    }

    // Validate each point
    const forecastPoints: ForecastPoint[] = data.points;
    for (const point of forecastPoints) {
      if (!validatePoint(point)) {
        throw new Error('Invalid point data. Each point must have lat, lon, timestamp, and distance as numbers within valid ranges.');
      }
    }

    // Get weather data for all points
    console.log('Requesting weather data for points:', forecastPoints);
    let weatherData: (WeatherData | null)[] = await getMultipleForecastPoints(forecastPoints);
    console.log('Received weather data:', weatherData);

    // Check if we got any valid data
    const hasValidData: boolean = weatherData.some(point => point !== null);

    // If no valid data, log the issue but don't generate mock data
    if (!hasValidData) {
      console.warn('No valid weather data found from OpenWeather API');
      console.warn('This could be due to API key issues or rate limiting');

      // Return empty array instead of mock data
      return {
        success: false,
        error: 'Failed to fetch weather data from OpenWeather API. Please check your API key.',
        data: [],
        provider: 'OpenWeather',
        timestamp: Date.now(),
        pointsProcessed: 0
      };
    }

    // Create a response with additional metadata
    const response: WeatherApiResponse = {
      success: true,
      data: weatherData, // Return the full array including nulls
      provider: 'OpenWeather',
      timestamp: Date.now(),
      pointsProcessed: weatherData.length
    };

    return response;
  });
}

/**
 * GET handler for single point weather data requests
 * @param req - The Next.js request object
 * @returns API response with weather data for a single point
 */
export async function GET(req: NextRequest): Promise<NextResponse<WeatherApiResponse>> {
  return apiHandler(req, async () => {
    const searchParams: URLSearchParams = req.nextUrl.searchParams;

    // Validate required parameters
    if (!searchParams.has('lat') || !searchParams.has('lon') ||
        !searchParams.has('timestamp') || !searchParams.has('distance')) {
      throw new Error('Missing required parameters. lat, lon, timestamp, and distance are required.');
    }

    // Parse and validate parameters
    const lat: number = parseFloat(searchParams.get('lat') || '');
    const lon: number = parseFloat(searchParams.get('lon') || '');
    const timestamp: number = parseInt(searchParams.get('timestamp') || '', 10);
    const distance: number = parseFloat(searchParams.get('distance') || '');

    if (isNaN(lat) || isNaN(lon) || isNaN(timestamp) || isNaN(distance)) {
      throw new Error('Invalid parameters. lat, lon, timestamp, and distance must be numbers.');
    }

    // Validate ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
    }

    // Create point object
    const point: ForecastPoint = { lat, lon, timestamp, distance };

    // Get weather data for the point
    const weatherData: WeatherData | null = await getWeatherForecast(point);

    // Check if we got valid data
    if (!weatherData) {
      throw new Error('Failed to fetch weather data for the given point.');
    }

    // Create a response with additional metadata
    const response: WeatherApiResponse = {
      success: true,
      data: [weatherData],
      provider: 'OpenWeather',
      timestamp: Date.now(),
      pointsProcessed: 1
    };

    return response;
  });
}
