/**
 * Weather service for handling weather data
 */

import { envConfig } from '@shared/lib/env';

/**
 * Weather data interface
 */
export interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name?: string;
  };
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts?: WeatherAlert[];
}

export interface CurrentWeather {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  rain?: {
    '1h'?: number;
  };
  snow?: {
    '1h'?: number;
  };
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  pop: number;
  rain?: {
    '1h'?: number;
  };
  snow?: {
    '1h'?: number;
  };
}

export interface DailyForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

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
 * Format temperature for display
 * @param temp - Temperature in Kelvin
 * @param unit - Temperature unit (celsius, fahrenheit)
 * @returns Formatted temperature string
 */
export function formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
  if (unit === 'fahrenheit') {
    return `${Math.round((temp - 273.15) * 9/5 + 32)}°F`;
  }
  return `${Math.round(temp - 273.15)}°C`;
}

/**
 * Format wind speed for display
 * @param speed - Wind speed in m/s
 * @param unit - Speed unit (kph, mph)
 * @returns Formatted wind speed string
 */
export function formatWindSpeed(speed: number, unit: 'kph' | 'mph' = 'kph'): string {
  if (unit === 'mph') {
    return `${Math.round(speed * 2.237)} mph`;
  }
  return `${Math.round(speed * 3.6)} km/h`;
}

/**
 * Format date for display
 * @param timestamp - Unix timestamp
 * @param format - Date format (full, short, time)
 * @returns Formatted date string
 */
export function formatDate(timestamp: number, format: 'full' | 'short' | 'time' = 'full'): string {
  const date = new Date(timestamp * 1000);
  
  if (format === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  if (format === 'short') {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  return date.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get weather icon URL
 * @param icon - Weather icon code
 * @param size - Icon size (small, medium, large)
 * @returns Weather icon URL
 */
export function getWeatherIconUrl(icon: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizeMap = {
    small: '2x',
    medium: '4x',
    large: '4x',
  };
  
  return `https://openweathermap.org/img/wn/${icon}@${sizeMap[size]}.png`;
}

/**
 * Get weather alert severity
 * @param alert - Weather alert
 * @returns Severity level (critical, warning, watch, advisory)
 */
export function getAlertSeverity(alert: WeatherAlert): 'critical' | 'warning' | 'watch' | 'advisory' {
  const event = alert.event.toLowerCase();
  
  if (event.includes('tornado') || event.includes('hurricane') || event.includes('tsunami')) {
    return 'critical';
  }
  
  if (event.includes('warning')) {
    return 'warning';
  }
  
  if (event.includes('watch')) {
    return 'watch';
  }
  
  return 'advisory';
}

/**
 * Get weather condition description
 * @param condition - Weather condition
 * @returns Detailed description
 */
export function getWeatherDescription(condition: WeatherCondition): string {
  // Map condition IDs to more detailed descriptions
  const descriptionMap: Record<number, string> = {
    200: 'Thunderstorm with light rain',
    201: 'Thunderstorm with rain',
    202: 'Thunderstorm with heavy rain',
    // Add more mappings as needed
  };
  
  return descriptionMap[condition.id] || condition.description;
}
