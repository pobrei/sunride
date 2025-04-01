import { validateWeatherData, WeatherData } from './weatherService';

/**
 * Weather provider interface
 */
interface WeatherProvider {
  name: string;
  getWeather(lat: number, lon: number, time: Date): Promise<WeatherData>;
  isAvailable(): Promise<boolean>;
}

/**
 * OpenWeather API implementation
 */
class OpenWeatherProvider implements WeatherProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  name = 'OpenWeather';
  
  async getWeather(lat: number, lon: number, time: Date): Promise<WeatherData> {
    try {
      const timestamp = Math.floor(time.getTime() / 1000);
      const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${this.apiKey}&units=metric`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to our schema
      const weatherData = {
        temperature: data.data[0].temp,
        humidity: data.data[0].humidity,
        windSpeed: data.data[0].wind_speed,
        precipitation: data.data[0].rain?.['1h'] || 0,
        pressure: data.data[0].pressure,
        clouds: data.data[0].clouds,
        time: new Date(data.data[0].dt * 1000).toISOString(),
        timezone: data.timezone
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
      // Simple test call to check if API is responsive
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${this.apiKey}`
      );
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
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  name = 'Visual Crossing';
  
  async getWeather(lat: number, lon: number, time: Date): Promise<WeatherData> {
    try {
      const dateStr = time.toISOString().split('T')[0];
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${dateStr}?key=${this.apiKey}&include=hours&elements=temp,humidity,windspeed,pressure,cloudcover,precip`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Visual Crossing API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Find the closest hour to the requested time
      const targetHour = time.getHours();
      const hourData = data.days[0].hours.find((h: { datetime: string }) => parseInt(h.datetime.split(':')[0]) === targetHour) || data.days[0].hours[0];
      
      // Transform API response to our schema
      const weatherData = {
        temperature: hourData.temp,
        humidity: hourData.humidity,
        windSpeed: hourData.windspeed,
        precipitation: hourData.precip,
        pressure: hourData.pressure,
        clouds: hourData.cloudcover,
        time: new Date(`${data.days[0].datetime}T${hourData.datetime}:00${data.tzoffset}`).toISOString(),
        timezone: data.timezone
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
      // Simple test call to check if API is responsive
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/London?key=${this.apiKey}&include=current`
      );
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
          console.warn(`Provider ${provider.name} failed:`, error);
          // Continue to next provider
        }
      }
      
      // If all providers failed
      throw new Error('All weather providers failed');
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
