/**
 * API utilities for fetching weather data
 */
import { ForecastPoint, WeatherData } from '@/types';
import { APIError, NetworkError } from '@shared/utils/errors';

/**
 * Configuration for API requests
 */
interface APIConfig {
  baseUrl: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

/**
 * Default API configuration
 */
const defaultConfig: APIConfig = {
  baseUrl: '/api',
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000
};

/**
 * Fetch weather data for multiple points
 * @param points Array of forecast points
 * @param config Optional API configuration
 * @returns Array of weather data (null for failed points)
 */
export async function fetchWeatherForPoints(
  points: ForecastPoint[],
  config: Partial<APIConfig> = {}
): Promise<(WeatherData | null)[]> {
  // Merge default config with provided config
  const apiConfig: APIConfig = { ...defaultConfig, ...config };

  // Validate input
  if (!points || !Array.isArray(points) || points.length === 0) {
    return [];
  }

  // Process points in batches to avoid overwhelming the API
  const batchSize = 5;
  const results: (WeatherData | null)[] = new Array(points.length).fill(null);

  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);
    const batchPromises = batch.map((point, index) =>
      fetchWeatherForPoint(point, apiConfig)
        .then(data => {
          results[i + index] = data;
          return data;
        })
        .catch(error => {
          console.error(`Error fetching weather for point ${i + index}:`, error);
          results[i + index] = null;
          return null;
        })
    );

    // Wait for the current batch to complete before starting the next one
    await Promise.all(batchPromises);

    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < points.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Fetch weather data for a single point
 * @param point Forecast point
 * @param config API configuration
 * @returns Weather data or null if failed
 */
async function fetchWeatherForPoint(
  point: ForecastPoint,
  config: APIConfig
): Promise<WeatherData> {
  // Validate point
  if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number' ||
      typeof point.timestamp !== 'number') {
    throw new Error('Invalid forecast point');
  }

  let retries = 0;

  while (retries <= config.maxRetries) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      // Prepare request
      const url = `${config.baseUrl}/weather`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lat: point.lat,
          lon: point.lon,
          timestamp: point.timestamp
        }),
        signal: controller.signal
      });

      // Clear timeout
      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        throw new APIError(
          `API error (${response.status}): ${errorText || response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      // Validate response data
      if (!data || typeof data !== 'object' ||
          typeof data.temperature !== 'number' ||
          typeof data.feelsLike !== 'number') {
        throw new Error('Invalid API response format');
      }

      return data as WeatherData;
    } catch (error) {
      retries++;

      // Handle abort (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (retries > config.maxRetries) {
          throw new NetworkError('Request timed out');
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        continue;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('network')) {
        if (retries > config.maxRetries) {
          throw new NetworkError('Network error');
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        continue;
      }

      // Rethrow other errors
      throw error;
    }
  }

  throw new NetworkError(`Failed after ${config.maxRetries} retries`);
}

/**
 * Save a route to the database
 * @param name Route name
 * @param gpxData GPX data
 * @param weatherData Weather data
 * @returns Saved route ID
 */
export async function saveRoute(
  name: string,
  gpxData: string,
  weatherData: WeatherData[]
): Promise<string> {
  try {
    const response = await fetch('/api/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        gpxData,
        weatherData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `API error (${response.status}): ${errorText || response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error saving route:', error);
    throw error;
  }
}

/**
 * Load a route from the database
 * @param id Route ID
 * @returns Route data
 */
export async function loadRoute(id: string): Promise<{
  name: string;
  gpxData: string;
  weatherData: WeatherData[];
}> {
  try {
    const response = await fetch(`/api/routes/${id}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `API error (${response.status}): ${errorText || response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading route ${id}:`, error);
    throw error;
  }
}

/**
 * Share a route
 * @param routeId Route ID
 * @returns Share URL
 */
export async function shareRoute(routeId: string): Promise<string> {
  try {
    const response = await fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        routeId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `API error (${response.status}): ${errorText || response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.shareUrl;
  } catch (error) {
    console.error('Error sharing route:', error);
    throw error;
  }
}
