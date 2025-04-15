// Add 'server-only' marker at the top of the file to prevent client usage
import 'server-only';
import { envConfig } from '@/lib/env';

// Check for OpenWeather API key
const USE_MOCK_DATA =
  !envConfig.openWeatherApiKey || envConfig.openWeatherApiKey === 'placeholder_key';

if (USE_MOCK_DATA) {
  console.warn(
    'Using mock weather data because no valid OpenWeather API key was provided. Please update your .env.local file with a valid API key.'
  );
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
const memoryCache: Map<string, { data: WeatherData; timestamp: number }> = new Map();

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
function log(...args: unknown[]) {
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

// Generate mock weather data for testing
function generateMockWeatherData(point: ForecastPoint): WeatherData {
  // Use timestamp to simulate time-of-day and seasonal variations
  const date = new Date(point.timestamp * 1000);
  const hour = date.getHours();
  const month = date.getMonth();

  // Seasonal temperature variations (Northern Hemisphere)
  const isSummer = month >= 5 && month <= 8;
  const isWinter = month <= 1 || month >= 10;

  // Base temperature varies by season
  let baseTemp = 20; // Spring/Fall
  if (isSummer) baseTemp = 28;
  if (isWinter) baseTemp = 5;

  // Temperature varies by time of day
  const hourFactor = Math.sin(((hour - 6) * Math.PI) / 12); // Peak at noon
  const tempVariation = hourFactor * 8; // 8°C variation throughout the day

  // Latitude affects temperature (colder at higher latitudes)
  const latitudeFactor = Math.abs(point.lat) / 90; // 0 at equator, 1 at poles
  const latitudeEffect = -latitudeFactor * 20; // Up to 20°C colder at poles

  // Calculate final temperature
  const temperature = baseTemp + tempVariation + latitudeEffect;

  // Weather conditions based on temperature and randomness
  const seed = (point.lat * 10 + point.lon * 5 + point.timestamp / 3600) % 100;
  const isRainy = seed < 30; // 30% chance of rain
  const isCloudy = seed < 60; // 60% chance of clouds

  // Weather icon and description
  let weatherIcon, weatherDescription;
  if (isRainy) {
    weatherIcon = hour >= 6 && hour < 18 ? '10d' : '10n'; // Rain
    weatherDescription = 'rain';
  } else if (isCloudy) {
    weatherIcon = hour >= 6 && hour < 18 ? '03d' : '03n'; // Scattered clouds
    weatherDescription = 'scattered clouds';
  } else {
    weatherIcon = hour >= 6 && hour < 18 ? '01d' : '01n'; // Clear sky
    weatherDescription = 'clear sky';
  }

  return {
    temperature: parseFloat(temperature.toFixed(1)),
    feelsLike: parseFloat((temperature - 2 + Math.random() * 4).toFixed(1)),
    humidity: Math.floor(isRainy ? 70 + Math.random() * 25 : 40 + Math.random() * 30),
    pressure: Math.floor(1000 + Math.sin(seed) * 20),
    windSpeed: parseFloat((2 + Math.random() * 8).toFixed(1)),
    windDirection: Math.floor(seed * 3.6) % 360,
    rain: isRainy ? parseFloat((Math.random() * 5).toFixed(1)) : 0,
    weatherIcon,
    weatherDescription,
    uvIndex: isCloudy ? parseFloat((Math.random() * 5).toFixed(1)) : parseFloat((Math.random() * 10).toFixed(1)),
    windGust: parseFloat((4 + Math.random() * 10).toFixed(1)),
    precipitationProbability: isRainy ? 0.3 + Math.random() * 0.7 : Math.random() * 0.3,
    precipitation: isRainy ? parseFloat((Math.random() * 5).toFixed(1)) : 0,
  };
}

// Fetch weather data for a specific point with in-memory caching
export async function getWeatherForecast(point: ForecastPoint): Promise<WeatherData | null> {
  try {
    // Validate input parameters
    if (
      !point ||
      typeof point.lat !== 'number' ||
      typeof point.lon !== 'number' ||
      typeof point.timestamp !== 'number' ||
      typeof point.distance !== 'number'
    ) {
      throw new Error(
        'Invalid point data. Each point must have lat, lon, timestamp, and distance as numbers.'
      );
    }

    if (point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180) {
      throw new Error(
        'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      );
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
      console.log('Fetching weather data from:', apiUrl);
      const response = await fetch(apiUrl, {
        next: { revalidate: 3600 },
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear timeout on success

      if (!response.ok) {
        const responseText = await response.text();
        console.error('API error:', response.status, responseText);
        log('API error:', response.status, responseText);

        throw new Error(`OpenWeather API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenWeather API response:', data);

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
          weatherDescription: data.weather?.[0]?.description ?? 'Unknown',
          uvIndex: data.uvi ?? parseFloat((Math.random() * 5).toFixed(1)),
          precipitation: data.rain ? data.rain['1h'] || 0 : 0,
          precipitationProbability: data.pop ?? 0,
        };
      } else {
        // Find the forecast entry closest to our timestamp
        const forecastList = data.list;
        if (!forecastList || !Array.isArray(forecastList) || forecastList.length === 0) {
          throw new Error('Invalid forecast data received from API');
        }

        // Define a type for the forecast entry
        interface ForecastEntry {
          dt: number;
          main?: {
            temp?: number;
            feels_like?: number;
            humidity?: number;
            pressure?: number;
          };
          wind?: {
            speed?: number;
            deg?: number;
          };
          rain?: {
            '3h'?: number;
          };
          weather?: Array<{
            icon?: string;
            description?: string;
          }>;
        }

        const closestForecast = forecastList.reduce((prev: ForecastEntry, curr: ForecastEntry) => {
          return Math.abs(curr.dt - point.timestamp) < Math.abs(prev.dt - point.timestamp)
            ? curr
            : prev;
        }, forecastList[0] as ForecastEntry);

        weatherData = {
          temperature: closestForecast.main?.temp ?? 0,
          feelsLike: closestForecast.main?.feels_like ?? 0,
          humidity: closestForecast.main?.humidity ?? 0,
          pressure: closestForecast.main?.pressure ?? 0,
          windSpeed: closestForecast.wind?.speed ?? 0,
          windDirection: closestForecast.wind?.deg ?? 0,
          rain: closestForecast.rain ? closestForecast.rain['3h'] || 0 : 0,
          weatherIcon: closestForecast.weather?.[0]?.icon ?? '01d',
          weatherDescription: closestForecast.weather?.[0]?.description ?? 'Unknown',
          uvIndex: closestForecast.uvi ?? parseFloat((Math.random() * 5).toFixed(1)),
          precipitation: closestForecast.rain ? closestForecast.rain['3h'] || 0 : 0,
          precipitationProbability: closestForecast.pop ?? 0,
        };
      }

      // Save to in-memory cache
      memoryCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now(),
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
export async function getMultipleForecastPoints(
  points: ForecastPoint[]
): Promise<(WeatherData | null)[]> {
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
        } catch (err) {
          // Log the error if debugging is enabled
          if (DEBUG) {
            console.error(`Error fetching forecast (attempt ${retry + 1}/${MAX_RETRIES}):`, err);
          }

          // If we've exhausted retries, give up
          if (retry === MAX_RETRIES - 1) {
            log(
              `Failed to fetch forecast for point at index ${i + batchIndex} after ${MAX_RETRIES} retries`
            );
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
