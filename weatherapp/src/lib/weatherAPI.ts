// Add 'server-only' marker at the top of the file to prevent client usage
import 'server-only';

// Validate OpenWeather API key
if (!process.env.OPENWEATHER_API_KEY) {
  throw new Error('Please add your OpenWeather API key to .env.local');
}

// Get environment variables with defaults
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION || '3600000', 10); // Default: 1 hour in milliseconds
const DEBUG = process.env.DEBUG === 'true';

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
  maxCalls: parseInt(process.env.RATE_LIMIT_MAX || '60', 10), // Default: 60 calls
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // Default: 1 minute window
};

// In-memory cache to replace MongoDB
const memoryCache: Map<string, { data: WeatherData, timestamp: number }> = new Map();

interface ForecastPoint {
  lat: number;
  lon: number;
  timestamp: number; // Unix timestamp
  distance: number; // Distance from start in km
}

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  rain: number;
  weatherIcon: string;
  weatherDescription: string;
  uvIndex?: number;
  windGust?: number;
  precipitationProbability?: number;
  precipitation?: number;
}

// Logger function that respects DEBUG flag
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[WeatherAPI]', ...args);
  }
}

// Check and update rate limiting
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

// Fetch weather data for a specific point with in-memory caching
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
      const response = await fetch(apiUrl, {
        next: { revalidate: 3600 },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout on success

      if (!response.ok) {
        const responseText = await response.text();
        log('API error:', response.status, responseText);

        throw new Error(`OpenWeather API error: ${response.status} - ${response.statusText}`);
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

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timeout: OpenWeather API did not respond in time');
      }

      throw fetchError; // Re-throw other errors
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

// Get multiple forecast points with automatic retries
export async function getMultipleForecastPoints(points: ForecastPoint[]): Promise<(WeatherData | null)[]> {
  if (!points || !Array.isArray(points) || points.length === 0) {
    throw new Error('Invalid points array');
  }

  // Process points in batches to avoid rate limiting
  const batchSize = 5;
  const results: (WeatherData | null)[] = new Array(points.length).fill(null);
  const MAX_RETRIES = 3;

  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);

    // Process each point in the batch with retry logic
    const batchPromises = batch.map(async (point, batchIndex) => {
      for (let retry = 0; retry < MAX_RETRIES; retry++) {
        try {
          return await getWeatherForecast(point);
        } catch (error) {
          // If we've exhausted retries, give up
          if (retry === MAX_RETRIES - 1) {
            log(`Failed to fetch forecast for point at index ${i + batchIndex} after ${MAX_RETRIES} retries`);
            return null;
          }

          // Otherwise wait and retry
          log(`Retry ${retry + 1}/${MAX_RETRIES} for point at index ${i + batchIndex}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1))); // Exponential backoff
        }
      }

      return null; // Fallback in case something goes wrong with retry logic
    });

    const batchResults = await Promise.all(batchPromises);

    for (let j = 0; j < batchResults.length; j++) {
      results[i + j] = batchResults[j];
    }

    // Small delay between batches to prevent rate limiting
    if (i + batchSize < points.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

// Export types for use in other files
export type { ForecastPoint, WeatherData };