'use client';

// Client-side API wrapper for MongoDB operations
import { ForecastPoint, WeatherData } from './weatherAPI';
import { captureException, captureMessage } from '@/lib/sentry';

// Max retry attempts for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Custom error types for better error handling
export class APIError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validate forecast points
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

// Fetch weather data through our API instead of direct MongoDB access
export async function fetchWeatherForPoints(
  points: ForecastPoint[]
): Promise<(WeatherData | null)[]> {
  let retries = 0;

  // Process progress
  const progress = {
    total: points.length,
    processed: 0,
    status: 'pending',
  };

  try {
    // Validate input
    validateForecastPoints(points);

    // If we have more than 100 points, process in batches
    const BATCH_SIZE = 100;
    if (points.length > BATCH_SIZE) {
      console.log(`Processing ${points.length} points in batches of ${BATCH_SIZE}`);
      const results: (WeatherData | null)[] = [];

      for (let i = 0; i < points.length; i += BATCH_SIZE) {
        const batch = points.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(points.length / BATCH_SIZE)}`);

        try {
          const batchResults = await fetchWeatherForPoints(batch);
          results.push(...batchResults);

          // Small delay between batches to prevent overwhelming the server
          if (i + BATCH_SIZE < points.length) {
            await delay(500);
          }
        } catch (error) {
          console.error(`Error processing batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
          // Fill with nulls for failed batch
          results.push(...batch.map(() => null));
        }
      }

      return results;
    }

    // Define retry logic in a separate function
    const fetchWithRetry = async (): Promise<(WeatherData | null)[]> => {
      try {
        // Check if we're online first (client-side only)
        if (typeof window !== 'undefined' && !window.navigator.onLine) {
          console.warn('Device is offline. Using fallback data.');
          // Return array of nulls with same length as points
          return points.map(() => null);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          const response = await fetch('/api/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            let errorMessage: string;

            try {
              const errorData = await response.json();
              errorMessage = errorData?.error || `Server responded with status: ${response.status}`;
            } catch {
              errorMessage = `API error: ${response.status} ${response.statusText}`;
            }

            throw new APIError(errorMessage, response.status);
          }

          const result = await response.json();

          // Validate the returned data structure
          if (!result) {
            throw new ValidationError('No response received from server');
          }

          // Handle both success and error responses
          if (result.error) {
            throw new APIError(result.error, result.status || 500);
          }

          // Ensure data is an array (even if empty)
          const weatherData = result.data && Array.isArray(result.data) ? result.data : [];

          // Log the response for debugging
          console.log('Weather API response:', {
            success: result.success,
            dataLength: weatherData.length,
          });

          progress.processed = weatherData.length;
          progress.status = 'completed';

          return weatherData;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError; // Re-throw to be handled by the retry logic
        }
      } catch (error: unknown) {
        // Handle abort errors (timeouts)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError('Request timed out. The server took too long to respond.');
        }

        // Handle network errors (connection refused, etc.)
        if (error instanceof Error &&
            (error.message.includes('fetch') ||
             error.message.includes('network') ||
             error.message.includes('connection'))) {
          console.warn('Network error detected:', error.message);

          // If we haven't hit max retries yet, try again
          if (retries < MAX_RETRIES) {
            retries++;
            console.log(`Retry ${retries}/${MAX_RETRIES} for weather data fetch`);
            progress.status = `retrying (${retries}/${MAX_RETRIES})`;

            await delay(RETRY_DELAY * retries); // Exponential backoff
            return fetchWithRetry();
          }

          // We've exhausted our retries, return null data instead of failing
          console.warn(`Failed to fetch weather data after ${MAX_RETRIES} retries due to network issues`);
          progress.status = 'completed with fallback';
          return points.map(() => null);
        }

        // For other errors, retry if we haven't hit max retries
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

      // For network errors, return null data instead of failing
      console.warn('Returning fallback data due to network error');
      return points.map(() => null);
    } else if (error instanceof APIError) {
      errorMessage = `API error (${error.status}): ${error.message}`;
      console.error(errorMessage);
      captureException(error, {
        context: 'fetchWeatherForPoints',
        type: 'api',
        status: error.status,
      });

      // For API errors, return null data if it's a server error (5xx)
      if (error.status >= 500) {
        console.warn('Returning fallback data due to server error');
        return points.map(() => null);
      }
    } else if (error instanceof Error) {
      errorMessage = `Error fetching weather data: ${error.message}`;
      console.error('Error fetching weather data:', error);
      captureException(error, { context: 'fetchWeatherForPoints' });

      // For fetch errors, return null data
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('connection')) {
        console.warn('Returning fallback data due to fetch error');
        return points.map(() => null);
      }
    } else {
      errorMessage = 'An unknown error occurred while fetching weather data';
      console.error('Unknown error:', error);
      captureMessage('Unknown error in fetchWeatherForPoints', 'error');
    }

    // Throw a descriptive error
    throw new Error(errorMessage);
  }
}

export async function fetchWeatherForPoint(point: ForecastPoint): Promise<WeatherData | null> {
  let retries = 0;

  try {
    // Validate input
    validateForecastPoints([point]);

    // Define retry logic in a separate function
    const fetchWithRetry = async (): Promise<WeatherData | null> => {
      try {
        const params = new URLSearchParams({
          lat: point.lat.toString(),
          lon: point.lon.toString(),
          timestamp: point.timestamp.toString(),
          distance: point.distance.toString(),
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`/api/weather?${params}`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage: string;

          try {
            const errorData = await response.json();
            errorMessage = errorData?.error || `Server responded with status: ${response.status}`;
          } catch {
            errorMessage = `API error: ${response.status} ${response.statusText}`;
          }

          throw new APIError(errorMessage, response.status);
        }

        const result = await response.json();

        // Validate the returned data structure
        if (!result) {
          throw new ValidationError('No response received from server');
        }

        // Handle both success and error responses
        if (result.error) {
          throw new APIError(result.error, result.status || 500);
        }

        // Ensure data is an array (even if empty)
        const weatherData = result.data && Array.isArray(result.data) ? result.data : [];

        // Log the response for debugging
        console.log('Weather API single point response:', {
          success: result.success,
          dataLength: weatherData.length,
        });

        // The API returns an array with a single item for GET requests
        return weatherData.length > 0 ? weatherData[0] : null;
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
