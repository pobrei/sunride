/**
 * Weather service utilities
 */

import { WeatherData, ForecastPoint, WeatherAlert } from '@shared/types';

/**
 * Validate weather data structure
 * @param data - Weather data to validate
 * @returns True if valid, throws error if invalid
 */
export function validateWeatherData(data: any): data is WeatherData {
  if (!data) {
    throw new Error('Weather data is null or undefined');
  }
  
  // Check location
  if (!data.location || typeof data.location.lat !== 'number' || typeof data.location.lon !== 'number') {
    throw new Error('Invalid location data');
  }
  
  // Check current weather
  if (!data.current || typeof data.current.temp !== 'number') {
    throw new Error('Invalid current weather data');
  }
  
  // Check hourly forecast
  if (!Array.isArray(data.hourly) || data.hourly.length === 0) {
    throw new Error('Invalid hourly forecast data');
  }
  
  // Check daily forecast
  if (!Array.isArray(data.daily) || data.daily.length === 0) {
    throw new Error('Invalid daily forecast data');
  }
  
  return true;
}

/**
 * Get weather alerts for a specific location
 * @param weatherData - Weather data
 * @returns Array of weather alerts
 */
export function getWeatherAlerts(weatherData: WeatherData): WeatherAlert[] {
  return weatherData.alerts || [];
}

/**
 * Check if there are any severe weather alerts
 * @param weatherData - Weather data
 * @returns True if severe alerts exist
 */
export function hasSevereAlerts(weatherData: WeatherData): boolean {
  const alerts = getWeatherAlerts(weatherData);
  
  if (alerts.length === 0) {
    return false;
  }
  
  // Check for severe alerts based on event name
  return alerts.some(alert => {
    const event = alert.event.toLowerCase();
    return (
      event.includes('warning') ||
      event.includes('tornado') ||
      event.includes('hurricane') ||
      event.includes('flood') ||
      event.includes('extreme')
    );
  });
}

/**
 * Get weather data for a specific forecast point
 * @param forecastPoint - Forecast point
 * @param weatherDataArray - Array of weather data
 * @returns Weather data for the point or null if not found
 */
export function getWeatherForPoint(
  forecastPoint: ForecastPoint,
  weatherDataArray: WeatherData[]
): WeatherData | null {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return null;
  }
  
  // Find weather data with matching coordinates
  return (
    weatherDataArray.find(
      data =>
        data.location.lat === forecastPoint.lat &&
        data.location.lon === forecastPoint.lon
    ) || null
  );
}

/**
 * Get temperature at a specific time
 * @param weatherData - Weather data
 * @param timestamp - Unix timestamp
 * @returns Temperature in Celsius or null if not found
 */
export function getTemperatureAtTime(
  weatherData: WeatherData,
  timestamp: number
): number | null {
  if (!weatherData || !weatherData.hourly || weatherData.hourly.length === 0) {
    return null;
  }
  
  // Find hourly forecast closest to the timestamp
  const hourlyForecast = weatherData.hourly.find(
    hourly => Math.abs(hourly.dt - timestamp) < 3600
  );
  
  return hourlyForecast ? hourlyForecast.temp : null;
}

/**
 * Get precipitation probability at a specific time
 * @param weatherData - Weather data
 * @param timestamp - Unix timestamp
 * @returns Precipitation probability (0-1) or null if not found
 */
export function getPrecipitationAtTime(
  weatherData: WeatherData,
  timestamp: number
): number | null {
  if (!weatherData || !weatherData.hourly || weatherData.hourly.length === 0) {
    return null;
  }
  
  // Find hourly forecast closest to the timestamp
  const hourlyForecast = weatherData.hourly.find(
    hourly => Math.abs(hourly.dt - timestamp) < 3600
  );
  
  return hourlyForecast ? hourlyForecast.pop : null;
}

/**
 * Get wind information at a specific time
 * @param weatherData - Weather data
 * @param timestamp - Unix timestamp
 * @returns Wind information or null if not found
 */
export function getWindAtTime(
  weatherData: WeatherData,
  timestamp: number
): { speed: number; deg: number; gust?: number } | null {
  if (!weatherData || !weatherData.hourly || weatherData.hourly.length === 0) {
    return null;
  }
  
  // Find hourly forecast closest to the timestamp
  const hourlyForecast = weatherData.hourly.find(
    hourly => Math.abs(hourly.dt - timestamp) < 3600
  );
  
  return hourlyForecast
    ? {
        speed: hourlyForecast.wind_speed,
        deg: hourlyForecast.wind_deg,
        gust: hourlyForecast.wind_gust,
      }
    : null;
}

/**
 * Calculate average temperature for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Average temperature in Celsius
 */
export function calculateAverageTemperature(
  weatherDataArray: WeatherData[]
): number {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return 0;
  }
  
  const sum = weatherDataArray.reduce(
    (total, data) => total + data.current.temp,
    0
  );
  
  return sum / weatherDataArray.length;
}

/**
 * Calculate maximum temperature for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Maximum temperature in Celsius
 */
export function calculateMaxTemperature(
  weatherDataArray: WeatherData[]
): number {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return 0;
  }
  
  return Math.max(...weatherDataArray.map(data => data.current.temp));
}

/**
 * Calculate minimum temperature for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Minimum temperature in Celsius
 */
export function calculateMinTemperature(
  weatherDataArray: WeatherData[]
): number {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return 0;
  }
  
  return Math.min(...weatherDataArray.map(data => data.current.temp));
}

/**
 * Calculate chance of rain for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Chance of rain (0-1)
 */
export function calculateChanceOfRain(
  weatherDataArray: WeatherData[]
): number {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return 0;
  }
  
  // Calculate maximum precipitation probability across all points
  return Math.max(
    ...weatherDataArray.map(data =>
      Math.max(...data.hourly.map(hour => hour.pop))
    )
  );
}

/**
 * Calculate average wind speed for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Average wind speed in m/s
 */
export function calculateAverageWindSpeed(
  weatherDataArray: WeatherData[]
): number {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return 0;
  }
  
  const sum = weatherDataArray.reduce(
    (total, data) => total + data.current.wind_speed,
    0
  );
  
  return sum / weatherDataArray.length;
}

/**
 * Calculate maximum wind speed for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Maximum wind speed in m/s
 */
export function calculateMaxWindSpeed(
  weatherDataArray: WeatherData[]
): number {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return 0;
  }
  
  return Math.max(...weatherDataArray.map(data => data.current.wind_speed));
}

/**
 * Calculate average UV index for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Average UV index
 */
export function calculateAverageUVIndex(
  weatherDataArray: WeatherData[]
): number {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return 0;
  }
  
  const sum = weatherDataArray.reduce(
    (total, data) => total + data.current.uvi,
    0
  );
  
  return sum / weatherDataArray.length;
}

/**
 * Calculate maximum UV index for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Maximum UV index
 */
export function calculateMaxUVIndex(
  weatherDataArray: WeatherData[]
): number {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return 0;
  }
  
  return Math.max(...weatherDataArray.map(data => data.current.uvi));
}

/**
 * Get all weather alerts for a route
 * @param weatherDataArray - Array of weather data for route points
 * @returns Array of weather alerts
 */
export function getAllWeatherAlerts(
  weatherDataArray: WeatherData[]
): WeatherAlert[] {
  if (!weatherDataArray || weatherDataArray.length === 0) {
    return [];
  }
  
  // Collect all alerts from all points
  const allAlerts = weatherDataArray.flatMap(data => data.alerts || []);
  
  // Remove duplicates based on event and start time
  const uniqueAlerts: WeatherAlert[] = [];
  const seenAlerts = new Set<string>();
  
  for (const alert of allAlerts) {
    const alertKey = `${alert.event}-${alert.start}`;
    
    if (!seenAlerts.has(alertKey)) {
      seenAlerts.add(alertKey);
      uniqueAlerts.push(alert);
    }
  }
  
  return uniqueAlerts;
}
