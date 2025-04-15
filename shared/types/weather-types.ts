/**
 * Weather data types
 */

import { ForecastPoint } from './gpx-types';

/**
 * Current weather conditions
 */
export interface CurrentWeather {
  /** Temperature in Celsius */
  temperature: number;
  /** Feels like temperature in Celsius */
  feelsLike: number;
  /** Humidity percentage */
  humidity: number;
  /** Atmospheric pressure in hPa */
  pressure: number;
  /** Wind speed in m/s */
  windSpeed: number;
  /** Wind direction in degrees */
  windDirection: number;
  /** Wind gust in m/s */
  windGust?: number;
  /** Visibility in meters */
  visibility?: number;
  /** UV index */
  uvIndex?: number;
  /** Weather condition code */
  conditionCode: number;
  /** Weather condition description */
  conditionDescription: string;
  /** Weather condition icon code */
  icon: string;
  /** Cloudiness percentage */
  clouds: number;
  /** Rain volume for the last hour in mm */
  rain?: number;
  /** Snow volume for the last hour in mm */
  snow?: number;
  /** Timestamp of the data in Unix format */
  timestamp: number;
}

/**
 * Weather alert severity levels
 */
export enum AlertSeverity {
  /** Moderate severity */
  MODERATE = 'moderate',
  /** Severe severity */
  SEVERE = 'severe',
  /** Extreme severity */
  EXTREME = 'extreme'
}

/**
 * Weather alert types
 */
export enum AlertType {
  /** High temperature alert */
  HIGH_TEMPERATURE = 'high_temperature',
  /** Low temperature alert */
  LOW_TEMPERATURE = 'low_temperature',
  /** High wind alert */
  HIGH_WIND = 'high_wind',
  /** Heavy rain alert */
  HEAVY_RAIN = 'heavy_rain',
  /** Heavy snow alert */
  HEAVY_SNOW = 'heavy_snow',
  /** Thunderstorm alert */
  THUNDERSTORM = 'thunderstorm',
  /** Fog alert */
  FOG = 'fog',
  /** UV index alert */
  UV_INDEX = 'uv_index',
  /** Air quality alert */
  AIR_QUALITY = 'air_quality',
  /** Other alert */
  OTHER = 'other'
}

/**
 * Weather alert
 */
export interface WeatherAlert {
  /** Alert type */
  type: AlertType;
  /** Alert severity */
  severity: AlertSeverity;
  /** Alert description */
  description: string;
  /** Start time in Unix format */
  start: number;
  /** End time in Unix format */
  end: number;
  /** Alert source */
  source?: string;
}

/**
 * Location information
 */
export interface Location {
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lon: number;
  /** Location name (optional) */
  name?: string;
}

/**
 * Weather data for a specific point
 */
export interface WeatherData {
  /** Temperature in Celsius */
  temperature: number;
  /** Feels like temperature in Celsius */
  feelsLike: number;
  /** Humidity percentage */
  humidity: number;
  /** Atmospheric pressure in hPa */
  pressure: number;
  /** Wind speed in m/s */
  windSpeed: number;
  /** Wind direction in degrees */
  windDirection: number;
  /** Wind gust in m/s */
  windGust: number;
  /** Rain volume for the last 3 hours in mm */
  rain: number;
  /** Snow volume for the last 3 hours in mm (optional for backward compatibility) */
  snow?: number;
  /** Precipitation probability (0-1) */
  precipitationProbability: number;
  /** Precipitation amount in mm (rain + snow) */
  precipitation: number;
  /** Weather condition code */
  conditionCode: number;
  /** Weather condition description */
  conditionDescription: string;
  /** Weather condition icon code */
  icon: string;
  /** Cloudiness percentage */
  clouds: number;
  /** UV index (0-11+) */
  uvIndex: number;
  /** Visibility in meters */
  visibility: number;
  /** Location information */
  location?: Location;
  /** Current weather conditions */
  current?: CurrentWeather;
  /** Weather alerts */
  alerts?: WeatherAlert[];
  /** Timestamp in Unix format */
  timestamp: number;
}

/**
 * Weather provider information
 */
export interface WeatherProvider {
  /** Provider name */
  name: string;
  /** Provider API key */
  apiKey?: string;
  /** Provider base URL */
  baseUrl?: string;
  /** Provider attribution text */
  attribution: string;
  /** Provider logo URL */
  logo?: string;
}

/**
 * Weather API response
 */
export interface WeatherResponse {
  /** Weather data for each forecast point */
  data: (WeatherData | null)[];
  /** Provider information */
  provider: WeatherProvider;
  /** Error message if any */
  error?: string;
}

/**
 * Weather API request
 */
export interface WeatherRequest {
  /** Forecast points to get weather for */
  forecastPoints: ForecastPoint[];
  /** Provider to use */
  provider?: string;
  /** API key to use */
  apiKey?: string;
}

/**
 * Normalize weather data to ensure backward compatibility
 */
export function normalizeWeatherData(data: WeatherData): WeatherData {
  // Create a copy to avoid modifying the original
  const result = { ...data };
  
  // Ensure snow property exists
  if (result.snow === undefined) {
    result.snow = 0;
  }
  
  // Ensure precipitation property exists
  if (result.precipitation === undefined) {
    result.precipitation = result.rain + (result.snow || 0);
  }
  
  // Ensure uvIndex property exists
  if (result.uvIndex === undefined) {
    result.uvIndex = 0;
  }
  
  // Ensure visibility property exists
  if (result.visibility === undefined) {
    result.visibility = 10000; // Default to 10km
  }
  
  return result;
}

/**
 * Merge weather data arrays
 */
export function mergeWeatherData(
  forecastPoints: ForecastPoint[],
  weatherData: (WeatherData | null)[]
): Array<ForecastPoint & { weather: WeatherData | null }> {
  return forecastPoints.map((point, index) => ({
    ...point,
    weather: index < weatherData.length ? weatherData[index] : null
  }));
}
