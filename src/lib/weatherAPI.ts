// Add 'server-only' marker at the top of the file to prevent client usage
import 'server-only';
// No longer importing clientPromise

// Validate OpenWeather API key
if (!process.env.OPENWEATHER_API_KEY) {
  throw new Error('Please add your OpenWeather API key to .env.local');
}

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

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
}

// Fetch weather data for a specific point with in-memory caching
export async function getWeatherForecast(point: ForecastPoint): Promise<WeatherData | null> {
  try {
    const hour = Math.floor(point.timestamp / 3600) * 3600;
    const cacheKey = `${point.lat.toFixed(4)},${point.lon.toFixed(4)},${hour}h`;
    
    // Check in-memory cache
    const cachedEntry = memoryCache.get(cacheKey);
    if (cachedEntry && cachedEntry.timestamp > Date.now() - CACHE_DURATION) {
      console.log('Cache hit for', cacheKey);
      return cachedEntry.data;
    }

    // Cache miss, fetch from API
    console.log('Cache miss for', cacheKey, 'fetching from API');
    
    // Determine if we need current weather or forecast
    const now = Date.now() / 1000;
    const isCurrentWeather = Math.abs(point.timestamp - now) < 3 * 3600; // Within 3 hours
    
    let apiUrl;
    if (isCurrentWeather) {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${point.lat}&lon=${point.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    } else {
      apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${point.lat}&lon=${point.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    }

    const response = await fetch(apiUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    let weatherData: WeatherData;
    
    if (isCurrentWeather) {
      weatherData = {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        rain: data.rain ? data.rain['1h'] || 0 : 0,
        weatherIcon: data.weather[0].icon,
        weatherDescription: data.weather[0].description
      };
    } else {
      // Find the forecast entry closest to our timestamp
      const forecastList = data.list;
      let closestForecast = forecastList.reduce((prev: any, curr: any) => {
        return Math.abs(curr.dt - point.timestamp) < Math.abs(prev.dt - point.timestamp) ? curr : prev;
      }, forecastList[0]);
      
      weatherData = {
        temperature: closestForecast.main.temp,
        feelsLike: closestForecast.main.feels_like,
        humidity: closestForecast.main.humidity,
        pressure: closestForecast.main.pressure,
        windSpeed: closestForecast.wind.speed,
        windDirection: closestForecast.wind.deg,
        rain: closestForecast.rain ? closestForecast.rain['3h'] || 0 : 0,
        weatherIcon: closestForecast.weather[0].icon,
        weatherDescription: closestForecast.weather[0].description
      };
    }

    // Save to in-memory cache
    memoryCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Get multiple forecast points
export async function getMultipleForecastPoints(points: ForecastPoint[]): Promise<(WeatherData | null)[]> {
  // Process points in batches to avoid rate limiting
  const batchSize = 5;
  const results: (WeatherData | null)[] = new Array(points.length).fill(null);
  
  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(point => getWeatherForecast(point)));
    
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