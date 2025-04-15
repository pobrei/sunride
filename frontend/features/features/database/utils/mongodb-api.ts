'use client';

// Client-side API wrapper for MongoDB operations
import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';
import { captureException, captureMessage } from '@frontend/features/monitoring';

// Max retry attempts for API calls
const MAX_RETRIES: number = 3;
const RETRY_DELAY: number = 1000; // 1 second delay between retries

/**
 * Helper function to delay execution
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Custom error types for better error handling
 */

/**
 * API Error with status code
 */
export class APIError extends Error {
  /** HTTP status code */
  status: number;

  /**
   * Create a new API error
   * @param message - Error message
   * @param status - HTTP status code
   */
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

/**
 * Network Error for connection issues
 */
export class NetworkError extends Error {
  /**
   * Create a new network error
   * @param message - Error message
   */
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Validation Error for data validation issues
 */
export class ValidationError extends Error {
  /**
   * Create a new validation error
   * @param message - Error message
   */
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate forecast points
 * @param points - Array of forecast points to validate
 * @throws ValidationError if points are invalid
 */
function validateForecastPoints(points: ForecastPoint[]): void {
  if (!points || !Array.isArray(points) || points.length === 0) {
    throw new ValidationError('No forecast points provided');
  }

  for (const point of points) {
    if (
      !point ||
      typeof point.lat !== 'number' ||
      typeof point.lon !== 'number' ||
      typeof point.timestamp !== 'number' ||
      typeof point.distance !== 'number'
    ) {
      throw new ValidationError(
        'Invalid point data. Each point must have lat, lon, timestamp, and distance as numbers.'
      );
    }

    if (point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180) {
      throw new ValidationError(
        'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      );
    }
  }
}

/**
 * Fetch weather data for multiple points through our API
 * @param points - Array of forecast points to get weather data for
 * @returns Array of weather data objects or null for points that couldn't be fetched
 */
export async function fetchWeatherForPoints(
  points: ForecastPoint[]
): Promise<(WeatherData | null)[]> {
  let retries: number = 0;

  // Process progress
  const progress: {
    total: number;
    processed: number;
    status: 'pending' | 'complete' | 'error';
  } = {
    total: points.length,
    processed: 0,
    status: 'pending',
  };

  try {
    // Validate input
    validateForecastPoints(points);

    /**
     * Define retry logic in a separate function
     * @returns Array of weather data objects or null for points that couldn't be fetched
     */
    const fetchWithRetry = async (): Promise<(WeatherData | null)[]> => {
      try {
        const controller: AbortController = new AbortController();
        const timeoutId: NodeJS.Timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response: Response = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage: string;

          try {
            const errorData: { error?: string } = await response.json();
            errorMessage = errorData?.error || `Server responded with status: ${response.status}`;
          } catch {
            errorMessage = `API error: ${response.status} ${response.statusText}`;
          }

          throw new APIError(errorMessage, response.status);
        }

        const result: { success: boolean; data: (WeatherData | null)[] } = await response.json();

        // Validate the returned data structure
        if (!result.data || !Array.isArray(result.data)) {
          throw new ValidationError('Invalid data structure received from server');
        }

        progress.processed = result.data.length;
        progress.status = 'completed';

        return result.data;
      } catch (error: unknown) {
        // Handle abort errors (timeouts)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError('Request timed out. The server took too long to respond.');
        }

        // If we haven't hit max retries yet, try again
        if (retries < MAX_RETRIES) {
          retries++;
          console.log(`Retry ${retries}/${MAX_RETRIES} for weather data fetch`);
          progress.status = `retrying (${retries}/${MAX_RETRIES})`;

          await delay(RETRY_DELAY * retries); // Exponential backoff
          return fetchWithRetry();
        }

        // We've exhausted our retries, propagate the error
        progress.status = 'failed';
        throw error;
      }
    };

    // Execute the fetch with retry logic
    return await fetchWithRetry();
  } catch (error: unknown) {
    // Format the error message based on error type
    let errorMessage: string;

    if (error instanceof ValidationError) {
      errorMessage = `Validation error: ${error.message}`;
      console.error(errorMessage);
      captureException(error, { context: 'fetchWeatherForPoints', type: 'validation' });
    } else if (error instanceof NetworkError) {
      errorMessage = `Network error: ${error.message}`;
      console.error(errorMessage);
      captureException(error, { context: 'fetchWeatherForPoints', type: 'network' });
    } else if (error instanceof APIError) {
      errorMessage = `API error (${error.status}): ${error.message}`;
      console.error(errorMessage);
      captureException(error, {
        context: 'fetchWeatherForPoints',
        type: 'api',
        status: error.status,
      });
    } else if (error instanceof Error) {
      errorMessage = `Error fetching weather data: ${error.message}`;
      console.error('Error fetching weather data:', error);
      captureException(error, { context: 'fetchWeatherForPoints' });
    } else {
      errorMessage = 'An unknown error occurred while fetching weather data';
      console.error('Unknown error:', error);
      captureMessage('Unknown error in fetchWeatherForPoints', 'error');
    }

    // Throw a descriptive error
    throw new Error(errorMessage);
  }
}

/**
 * Fetch weather data for a single point
 * @param point - Forecast point to get weather data for
 * @returns Weather data for the point or null if not available
 * @throws Error if the point data is invalid or if the API request fails
 */
export async function fetchWeatherForPoint(point: ForecastPoint): Promise<WeatherData | null> {
  let retries: number = 0;

  try {
    // Validate input
    validateForecastPoints([point]);

    /**
     * Define retry logic in a separate function
     * @returns Weather data object or null if it couldn't be fetched
     */
    const fetchWithRetry = async (): Promise<WeatherData | null> => {
      try {
        const params: URLSearchParams = new URLSearchParams({
          lat: point.lat.toString(),
          lon: point.lon.toString(),
          timestamp: point.timestamp.toString(),
          distance: point.distance.toString(),
        });

        const controller: AbortController = new AbortController();
        const timeoutId: NodeJS.Timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response: Response = await fetch(`/api/weather?${params}`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage: string;

          try {
            const errorData: { error?: string } = await response.json();
            errorMessage = errorData?.error || `Server responded with status: ${response.status}`;
          } catch {
            errorMessage = `API error: ${response.status} ${response.statusText}`;
          }

          throw new APIError(errorMessage, response.status);
        }

        const result: { success: boolean; data: WeatherData | null } = await response.json();

        // Validate the returned data
        if (!result.data) {
          throw new ValidationError('Invalid data structure received from server');
        }

        return result.data;
      } catch (error: unknown) {
        // Handle abort errors (timeouts)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError('Request timed out. The server took too long to respond.');
        }

        // If we haven't hit max retries yet, try again
        if (retries < MAX_RETRIES) {
          retries++;
          console.log(`Retry ${retries}/${MAX_RETRIES} for weather data fetch`);
          await delay(RETRY_DELAY * retries); // Exponential backoff
          return fetchWithRetry();
        }

        // We've exhausted our retries, propagate the error
        throw error;
      }
    };

    return await fetchWithRetry();
  } catch (error: unknown) {
    // Format the error message based on error type
    let errorMessage: string;

    if (error instanceof ValidationError) {
      errorMessage = `Validation error: ${error.message}`;
      captureException(error, {
        context: 'fetchWeatherForPoint',
        type: 'validation',
        point: { lat: point.lat, lon: point.lon, timestamp: point.timestamp },
      });
    } else if (error instanceof NetworkError) {
      errorMessage = `Network error: ${error.message}`;
      captureException(error, {
        context: 'fetchWeatherForPoint',
        type: 'network',
        point: { lat: point.lat, lon: point.lon, timestamp: point.timestamp },
      });
    } else if (error instanceof APIError) {
      errorMessage = `API error (${error.status}): ${error.message}`;
      captureException(error, {
        context: 'fetchWeatherForPoint',
        type: 'api',
        status: error.status,
        point: { lat: point.lat, lon: point.lon, timestamp: point.timestamp },
      });
    } else if (error instanceof Error) {
      errorMessage = `Error fetching weather data: ${error.message}`;
      captureException(error, {
        context: 'fetchWeatherForPoint',
        point: { lat: point.lat, lon: point.lon, timestamp: point.timestamp },
      });
    } else {
      errorMessage = 'An unknown error occurred while fetching weather data';
      captureMessage('Unknown error in fetchWeatherForPoint', 'error');
    }

    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
