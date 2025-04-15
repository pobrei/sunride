import { validateWeatherData, WeatherData } from './weatherService';

/**
 * Custom error types for better error handling
 */
export class WeatherApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

export class WeatherProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherProviderError';
  }
}

/**
 * Rate limiter interface
 */
interface RateLimiter {
  acquire(): Promise<void>;
}

/**
 * Simple rate limiter implementation with concurrent request handling
 */
export class SimpleRateLimiter implements RateLimiter {
  private lastRequest: number = 0;
  private minInterval: number;
  private queue: Set<Promise<void>> = new Set();

  constructor(requestsPerSecond: number) {
    this.minInterval = 1000 / requestsPerSecond;
  }

  async acquire(): Promise<void> {
    // Add to queue
    const promise = new Promise<void>(resolve => {
      const now = Date.now();
      const timeSinceLast = now - this.lastRequest;

      if (timeSinceLast < this.minInterval) {
        setTimeout(resolve, this.minInterval - timeSinceLast);
      } else {
        resolve();
      }
    });

    // Track this promise
    this.queue.add(promise);
    await promise;

    // Update last request time
    this.lastRequest = Date.now();

    // Clean up queue by removing resolved promises
    this.queue.delete(promise);
  }
}

/**
 * Weather provider interface
 */
interface WeatherProvider {
  name: string;
  getWeather(lat: number, lon: number, time: Date): Promise<WeatherData>;
  isAvailable(): Promise<boolean>;
  rateLimiter: RateLimiter;
}

/**
 * OpenWeather API implementation
 */
class OpenWeatherProvider implements WeatherProvider {
  private apiKey: string;
  rateLimiter: RateLimiter;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.rateLimiter = new SimpleRateLimiter(10); // 10 requests per second
  }

  name = 'OpenWeather';

  private async makeRequest(url: string): Promise<any> {
    try {
      await this.rateLimiter.acquire();
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new WeatherApiError(
          `OpenWeather API error (${response.status}): ${errorData.message || 'Unknown error'}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }
      throw new WeatherProviderError('Failed to make request to OpenWeather API');
    }
  }

  async getWeather(lat: number, lon: number, time: Date): Promise<WeatherData> {
    try {
      const timestamp = Math.floor(time.getTime() / 1000);
      const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${this.apiKey}&units=metric`;

      const data = await this.makeRequest(url);

      if (!data.data || data.data.length === 0) {
        throw new WeatherProviderError('No weather data available for the requested time');
      }

      // Transform API response to our schema
      const weatherData = {
        temperature: data.data[0].temp,
        humidity: data.data[0].humidity,
        windSpeed: data.data[0].wind_speed,
        precipitation: data.data[0].rain?.['1h'] || 0,
        pressure: data.data[0].pressure,
        clouds: data.data[0].clouds,
        time: new Date(data.data[0].dt * 1000).toISOString(),
        timezone: data.timezone,
      };

      // Validate data against our schema
      return validateWeatherData(weatherData);
    } catch (error) {
      console.error('OpenWeather API error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${this.apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Visual Crossing Weather API (fallback provider)
 */
class VisualCrossingProvider implements WeatherProvider {
  private apiKey: string;
  rateLimiter: RateLimiter;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.rateLimiter = new SimpleRateLimiter(5); // 5 requests per second
  }

  name = 'Visual Crossing';

  private async makeRequest(url: string): Promise<any> {
    try {
      await this.rateLimiter.acquire();
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new WeatherApiError(
          `Visual Crossing API error (${response.status}): ${errorData.message || 'Unknown error'}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }
      throw new WeatherProviderError('Failed to make request to Visual Crossing API');
    }
  }

  async getWeather(lat: number, lon: number, time: Date): Promise<WeatherData> {
    try {
      const dateStr = time.toISOString().split('T')[0];
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${dateStr}?key=${this.apiKey}&include=hours&elements=temp,humidity,windspeed,pressure,cloudcover,precip`;

      const data = await this.makeRequest(url);

      if (!data.days || data.days.length === 0) {
        throw new WeatherProviderError('No weather data available for the requested time');
      }

      // Find the closest hour to the requested time
      const targetHour = time.getHours();
      const hourData = data.days[0].hours.find((h: { datetime: string }) => {
        const hour = parseInt(h.datetime.split(':')[0]);
        return Math.abs(hour - targetHour) <= 1; // Allow 1 hour tolerance
      });

      if (!hourData) {
        throw new WeatherProviderError('No weather data available for the requested hour');
      }

      // Transform API response to our schema
      const weatherData = {
        temperature: hourData.temp,
        humidity: hourData.humidity,
        windSpeed: hourData.windspeed,
        precipitation: hourData.precip,
        pressure: hourData.pressure,
        clouds: hourData.cloudcover,
        time: new Date(
          `${data.days[0].datetime}T${hourData.datetime}:00${data.tzoffset}`
        ).toISOString(),
        timezone: data.timezone,
      };

      // Validate data against our schema
      return validateWeatherData(weatherData);
    } catch (error) {
      console.error('Visual Crossing API error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/London?key=${this.apiKey}&include=current`;
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Weather service with provider redundancy
 */
export class WeatherService {
  private providers: WeatherProvider[] = [];
  private activeCalls = new Map<string, Promise<WeatherData>>();

  constructor(openWeatherApiKey: string, visualCrossingApiKey?: string) {
    // Add OpenWeather as primary provider
    this.providers.push(new OpenWeatherProvider(openWeatherApiKey));

    // Add Visual Crossing as fallback if API key provided
    if (visualCrossingApiKey) {
      this.providers.push(new VisualCrossingProvider(visualCrossingApiKey));
    }
  }

  /**
   * Get weather data with automatic fallback to alternative providers
   */
  async getWeather(lat: number, lon: number, time: Date): Promise<WeatherData> {
    // Create unique key for this request to implement request deduplication
    const cacheKey = `${lat},${lon},${time.toISOString()}`;

    // Return existing promise if this exact request is in flight
    if (this.activeCalls.has(cacheKey)) {
      const cachedPromise = this.activeCalls.get(cacheKey);
      if (cachedPromise) {
        return cachedPromise;
      }
    }

    // Create the promise for this weather request
    const weatherPromise = (async () => {
      // Try each provider in order until successful
      for (const provider of this.providers) {
        try {
          if (await provider.isAvailable()) {
            const data = await provider.getWeather(lat, lon, time);
            console.log(`Weather data fetched from ${provider.name}`);
            return data;
          }
        } catch (error) {
          if (error instanceof WeatherApiError) {
            console.warn(
              `Provider ${provider.name} API error (status ${error.statusCode}):`,
              error.message
            );
          } else if (error instanceof WeatherProviderError) {
            console.warn(`Provider ${provider.name} error:`, error.message);
          } else {
            console.warn(`Provider ${provider.name} failed with unknown error:`, error);
          }
          // Continue to next provider
        }
      }

      // If all providers failed
      throw new Error('All weather providers failed to fetch data');
    })();

    // Store the promise in the active calls map
    this.activeCalls.set(cacheKey, weatherPromise);

    try {
      // Wait for the data
      const result = await weatherPromise;
      return result;
    } finally {
      // Clear from active calls when done
      this.activeCalls.delete(cacheKey);
    }
  }
}
