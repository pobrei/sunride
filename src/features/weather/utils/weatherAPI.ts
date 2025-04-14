// Add 'server-only' marker at the top of the file to prevent client usage
import 'server-only';
import { envConfig } from '@/lib/env';

// Check for OpenWeather API key
const USE_MOCK_DATA = !envConfig.openWeatherApiKey || envConfig.openWeatherApiKey === 'placeholder_key';

if (USE_MOCK_DATA) {
  console.warn('Using mock weather data because no valid OpenWeather API key was provided');
}

// Get environment variables from envConfig
const OPENWEATHER_API_KEY = envConfig.openWeatherApiKey;
// Use environment variables from envConfig
const CACHE_DURATION = envConfig.cacheDuration;
const DEBUG = envConfig.debug;

// Tracking API usage for rate limiting
interface RateLimitTracker {
  lastReset: number;
  callCount: number;
  maxCalls: number;
  windowMs: number;
}

// Initialize rate limit tracker
const rateLimitTracker: RateLimitTracker = {
  lastReset: Date.now(),
  callCount: 0,
  maxCalls: envConfig.apiRateLimit, // From envConfig
  windowMs: envConfig.apiRateLimitWindowMs, // From envConfig
};

// In-memory cache to replace MongoDB
const memoryCache: Map<string, { data: WeatherData, timestamp: number }> = new Map();

/**
 * Represents a point along a route for which to fetch a weather forecast
 */
export interface ForecastPoint {
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lon: number;
  /** Unix timestamp in seconds */
  timestamp: number;
  /** Distance from the start of the route in kilometers */
  distance: number;
}

/**
 * Represents weather data for a specific point and time
 */
export interface WeatherData {
  /** Temperature in Celsius */
  temperature: number;
  /** Feels like temperature in Celsius */
  feelsLike: number;
  /** Humidity percentage (0-100) */
  humidity: number;
  /** Atmospheric pressure in hPa */
  pressure: number;
  /** Wind speed in km/h */
  windSpeed: number;
  /** Wind direction in degrees (0-360, 0 = North) */
  windDirection: number;
  /** Rain amount in mm */
  rain: number;
  /** Weather icon code */
  weatherIcon: string;
  /** Weather description text */
  weatherDescription: string;
  /** UV index (0-12) */
  uvIndex?: number;
  /** Wind gust speed in km/h */
  windGust?: number;
  /** Probability of precipitation (0-1) */
  precipitationProbability?: number;
  /** Precipitation amount in mm (includes rain, snow, etc.) */
  precipitation?: number;
  /** Snow amount in mm */
  snow?: number;
}

/**
 * Logger function that respects DEBUG flag
 * @param args - Arguments to log
 */
function log(...args: unknown[]): void {
  if (DEBUG) {
    console.log('[WeatherAPI]', ...args);
  }
}

/**
 * Check and update rate limiting
 * @returns True if request is allowed, false if rate limit is exceeded
 */
function checkRateLimit(): boolean {
  const now = Date.now();

  // Reset counter if window has passed
  if (now - rateLimitTracker.lastReset > rateLimitTracker.windowMs) {
    rateLimitTracker.lastReset = now;
    rateLimitTracker.callCount = 0;
    log('Rate limit counter reset');
  }

  // Check if we're over the limit
  if (rateLimitTracker.callCount >= rateLimitTracker.maxCalls) {
    log('Rate limit exceeded');
    return false;
  }

  // Increment counter
  rateLimitTracker.callCount++;
  return true;
}

/**
 * Generate mock weather data for testing
 * @param point - Forecast point to generate weather data for
 * @returns Simulated weather data
 */
function generateMockWeatherData(point: ForecastPoint): WeatherData {
  // Use the point's coordinates to generate deterministic but varied mock data
  const seed = (point.lat * 10 + point.lon * 5 + point.timestamp / 3600) % 100;

  // Generate weather conditions based on seed
  const conditions = [
    { icon: '01d', desc: 'clear sky' },
    { icon: '02d', desc: 'few clouds' },
    { icon: '03d', desc: 'scattered clouds' },
    { icon: '04d', desc: 'broken clouds' },
    { icon: '09d', desc: 'shower rain' },
    { icon: '10d', desc: 'rain' },
    { icon: '11d', desc: 'thunderstorm' },
    { icon: '13d', desc: 'snow' },
    { icon: '50d', desc: 'mist' }
  ];

  const conditionIndex = Math.floor(seed % conditions.length);
  const temp = 15 + Math.sin(seed) * 15; // Temperature between 0 and 30°C
  const rain = conditionIndex >= 4 ? (conditionIndex - 3) * 2 : 0; // Rain for rainy conditions

  return {
    temperature: parseFloat(temp.toFixed(1)),
    feelsLike: parseFloat((temp - 2 + Math.random() * 4).toFixed(1)),
    humidity: Math.floor(40 + seed % 60), // Humidity between 40% and 99%
    pressure: Math.floor(980 + seed % 40), // Pressure between 980 and 1020 hPa
    windSpeed: parseFloat((2 + seed % 8).toFixed(1)), // Wind speed between 2 and 10 m/s
    windDirection: Math.floor(seed * 3.6) % 360, // Wind direction between 0 and 359 degrees
    rain: rain,
    weatherIcon: conditions[conditionIndex].icon,
    weatherDescription: conditions[conditionIndex].desc,
    uvIndex: Math.floor(seed % 11), // UV index between 0 and 10
    windGust: parseFloat((4 + seed % 10).toFixed(1)), // Wind gust between 4 and 14 m/s
    precipitationProbability: Math.floor(seed % 100) / 100 // Probability between 0 and 0.99
  };
}

/**
 * Fetch weather data for a specific point with in-memory caching
 * @param point - Forecast point to get weather data for
 * @returns Weather data for the point or null if not available
 * @throws Error if the point data is invalid or if the API request fails
 */
export async function getWeatherForecast(point: ForecastPoint): Promise<WeatherData | null> {
  try {
    // Validate input parameters
    if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number' ||
        typeof point.timestamp !== 'number' || typeof point.distance !== 'number') {
      throw new Error('Invalid point data. Each point must have lat, lon, timestamp, and distance as numbers.');
    }

    if (point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180) {
      throw new Error('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
    }

    // If using mock data, return it immediately
    if (USE_MOCK_DATA) {
      const mockData = generateMockWeatherData(point);
      log('Using mock data for', `${point.lat.toFixed(4)},${point.lon.toFixed(4)}`);
      return mockData;
    }

    const hour = Math.floor(point.timestamp / 3600) * 3600;
    const cacheKey = `${point.lat.toFixed(4)},${point.lon.toFixed(4)},${hour}h`;

    // Check in-memory cache
    const cachedEntry = memoryCache.get(cacheKey);
    if (cachedEntry && cachedEntry.timestamp > Date.now() - CACHE_DURATION) {
      log('Cache hit for', cacheKey);
      return cachedEntry.data;
    }

    // Cache miss, check rate limit before fetching from API
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    log('Cache miss for', cacheKey, 'fetching from API');

    // Determine if we need current weather or forecast
    const now = Date.now() / 1000;
    const isCurrentWeather = Math.abs(point.timestamp - now) < 3 * 3600; // Within 3 hours

    let apiUrl;
    if (isCurrentWeather) {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${point.lat}&lon=${point.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    } else {
      apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${point.lat}&lon=${point.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    }

    // Add timeout and retry logic for network failures
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      // Note: We can't check navigator.onLine on the server side
      // Network errors will be caught in the catch block

      const response = await fetch(apiUrl, {
        next: { revalidate: 3600 },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout on success

      if (!response.ok) {
        const responseText = await response.text();
        log('API error:', response.status, responseText);

        // Provide more specific error messages based on status code
        switch (response.status) {
          case 401:
            throw new Error('API authentication failed. Please check your API key.');
          case 404:
            throw new Error('Weather data not found for this location.');
          case 429:
            throw new Error('API rate limit exceeded. Please try again later.');
          case 500:
          case 502:
          case 503:
          case 504:
            throw new Error('Weather service is currently unavailable. Please try again later.');
          default:
            throw new Error(`OpenWeather API error: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();

      let weatherData: WeatherData;

      if (isCurrentWeather) {
        weatherData = {
          temperature: data.main?.temp ?? 0,
          feelsLike: data.main?.feels_like ?? 0,
          humidity: data.main?.humidity ?? 0,
          pressure: data.main?.pressure ?? 0,
          windSpeed: data.wind?.speed ?? 0,
          windDirection: data.wind?.deg ?? 0,
          rain: data.rain ? data.rain['1h'] || 0 : 0,
          weatherIcon: data.weather?.[0]?.icon ?? '01d',
          weatherDescription: data.weather?.[0]?.description ?? 'Unknown'
        };
      } else {
        // Find the forecast entry closest to our timestamp
        const forecastList = data.list;
        if (!forecastList || !Array.isArray(forecastList) || forecastList.length === 0) {
          throw new Error('Invalid forecast data received from API');
        }

        const closestForecast = forecastList.reduce((prev: any, curr: any) => {
          return Math.abs(curr.dt - point.timestamp) < Math.abs(prev.dt - point.timestamp) ? curr : prev;
        }, forecastList[0]);

        weatherData = {
          temperature: closestForecast.main?.temp ?? 0,
          feelsLike: closestForecast.main?.feels_like ?? 0,
          humidity: closestForecast.main?.humidity ?? 0,
          pressure: closestForecast.main?.pressure ?? 0,
          windSpeed: closestForecast.wind?.speed ?? 0,
          windDirection: closestForecast.wind?.deg ?? 0,
          rain: closestForecast.rain ? closestForecast.rain['3h'] || 0 : 0,
          weatherIcon: closestForecast.weather?.[0]?.icon ?? '01d',
          weatherDescription: closestForecast.weather?.[0]?.description ?? 'Unknown'
        };
      }

      // Save to in-memory cache
      memoryCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId); // Clear timeout on error

      // Handle different types of fetch errors with specific messages
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout: Weather API did not respond in time. Please try again later.');
        } else if (fetchError.message.includes('fetch failed')) {
          throw new Error('Network error: Unable to connect to the weather service. Please check your internet connection.');
        } else if (fetchError.message.includes('ENOTFOUND') || fetchError.message.includes('getaddrinfo')) {
          throw new Error('DNS resolution error: Unable to resolve the weather service domain. Please check your internet connection.');
        } else if (fetchError.message.includes('ECONNRESET') || fetchError.message.includes('socket hang up')) {
          throw new Error('Connection reset: The connection to the weather service was interrupted. Please try again.');
        } else if (fetchError.message.includes('ETIMEDOUT')) {
          throw new Error('Connection timeout: The weather service took too long to respond. Please try again later.');
        }
      }

      // If we get here, it's an unknown error type
      log('Unknown fetch error:', fetchError);
      throw new Error('Failed to fetch weather data. Please try again later.');
    }
  } catch (error) {
    log('Error fetching weather data:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    } else {
      throw new Error('Unknown error occurred while fetching weather data');
    }
  }
}

/**
 * Get weather data for multiple forecast points with automatic retries
 * @param points - Array of forecast points to get weather data for
 * @returns Array of weather data objects or null for points that couldn't be fetched
 * @throws Error if the points array is invalid
 */
export async function getMultipleForecastPoints(points: ForecastPoint[]): Promise<(WeatherData | null)[]> {
  try {
    // Validate input
    if (!points) {
      throw new Error('Points array is required');
    }

    if (!Array.isArray(points)) {
      throw new Error('Points must be an array');
    }

    if (points.length === 0) {
      throw new Error('Points array cannot be empty');
    }

    // Validate each point has required properties
    const invalidPoints = points.filter(p => {
      return !p ||
             typeof p.lat !== 'number' ||
             typeof p.lon !== 'number' ||
             typeof p.timestamp !== 'number' ||
             typeof p.distance !== 'number';
    });

    if (invalidPoints.length > 0) {
      throw new Error(`Found ${invalidPoints.length} invalid points. Each point must have lat, lon, timestamp, and distance as numbers.`);
    }

    // Process points in batches to avoid rate limiting
    const batchSize = 5;
    const results: (WeatherData | null)[] = new Array(points.length).fill(null);
    const MAX_RETRIES = 3;

    // Track success rate for diagnostics
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);

      // Process each point in the batch with retry logic
      const batchPromises = batch.map(async (point, batchIndex) => {
        for (let retry = 0; retry < MAX_RETRIES; retry++) {
          try {
            const result = await getWeatherForecast(point);
            successCount++;
            return result;
          } catch (error) {
            // If we've exhausted retries, give up
            if (retry === MAX_RETRIES - 1) {
              failureCount++;
              log(`Failed to fetch forecast for point at index ${i + batchIndex} after ${MAX_RETRIES} retries:`, error);
              return null;
            }

            // Otherwise wait and retry with exponential backoff
            const backoffTime = 1000 * Math.pow(2, retry); // 1s, 2s, 4s
            log(`Retry ${retry + 1}/${MAX_RETRIES} for point at index ${i + batchIndex} in ${backoffTime}ms`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }

        return null; // Fallback in case something goes wrong with retry logic
      });

      try {
        const batchResults = await Promise.all(batchPromises);

        for (let j = 0; j < batchResults.length; j++) {
          results[i + j] = batchResults[j];
        }

        // Small delay between batches to prevent rate limiting
        if (i + batchSize < points.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (batchError) {
        log('Error processing batch:', batchError);
        // Continue with next batch instead of failing completely
      }
    }

    // Log success rate
    const totalAttempted = successCount + failureCount;
    if (totalAttempted > 0) {
      const successRate = Math.round((successCount / totalAttempted) * 100);
      log(`Weather data fetch complete. Success rate: ${successRate}% (${successCount}/${totalAttempted})`);

      // If success rate is too low, log a warning
      if (successRate < 50 && totalAttempted > 5) {
        console.warn(`Low weather data success rate (${successRate}%). There may be issues with the weather service.`);
      }
    }

    return results;
  } catch (error) {
    log('Error in getMultipleForecastPoints:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to fetch weather forecasts: ${error.message}`
        : 'Unknown error fetching weather forecasts'
    );
  }
}

// Export types for use in other files
export type { ForecastPoint, WeatherData };