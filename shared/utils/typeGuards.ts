/**
 * Type guard utilities for runtime type checking
 */
import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';
import { GPXData, RoutePoint } from '@frontend/features/gpx/types';

/**
 * Type guard for ForecastPoint
 * @param value - Value to check
 * @returns True if the value is a valid ForecastPoint
 */
export function isForecastPoint(value: unknown): value is ForecastPoint {
  if (!value || typeof value !== 'object') return false;

  const point = value as Partial<ForecastPoint>;

  return (
    typeof point.lat === 'number' &&
    typeof point.lon === 'number' &&
    !isNaN(point.lat) &&
    !isNaN(point.lon) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lon >= -180 &&
    point.lon <= 180 &&
    typeof point.timestamp === 'number' &&
    typeof point.distance === 'number'
  );
}

/**
 * Type guard for WeatherData
 * @param value - Value to check
 * @returns True if the value is a valid WeatherData
 */
export function isWeatherData(value: unknown): value is WeatherData {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<WeatherData>;

  const requiredNumericProps: Array<keyof WeatherData> = [
    'temperature',
    'feelsLike',
    'humidity',
    'pressure',
    'windSpeed',
    'rain',
  ];

  const requiredStringProps: Array<keyof WeatherData> = ['weatherIcon', 'weatherDescription'];

  // Check required numeric properties
  const hasRequiredNumericProps = requiredNumericProps.every(
    prop => typeof data[prop] === 'number' && !isNaN(data[prop] as number)
  );

  // Check required string properties
  const hasRequiredStringProps = requiredStringProps.every(prop => typeof data[prop] === 'string');

  return hasRequiredNumericProps && hasRequiredStringProps;
}

/**
 * Type guard for RoutePoint
 * @param value - Value to check
 * @returns True if the value is a valid RoutePoint
 */
export function isRoutePoint(value: unknown): value is RoutePoint {
  if (!value || typeof value !== 'object') return false;

  const point = value as Partial<RoutePoint>;

  return (
    typeof point.lat === 'number' &&
    typeof point.lon === 'number' &&
    !isNaN(point.lat) &&
    !isNaN(point.lon) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lon >= -180 &&
    point.lon <= 180 &&
    typeof point.elevation === 'number' &&
    typeof point.distance === 'number'
  );
}

/**
 * Type guard for GPXData
 * @param value - Value to check
 * @returns True if the value is a valid GPXData
 */
export function isGPXData(value: unknown): value is GPXData {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<GPXData>;

  // Check if name is a string
  if (typeof data.name !== 'string') return false;

  // Check if points is an array
  if (!Array.isArray(data.points)) return false;

  // Check numeric properties
  const numericProps: Array<keyof GPXData> = [
    'totalDistance',
    'elevationGain',
    'elevationLoss',
    'maxElevation',
    'minElevation',
  ];

  const hasNumericProps = numericProps.every(
    prop => typeof data[prop] === 'number' && !isNaN(data[prop] as number)
  );

  return hasNumericProps;
}

/**
 * Asserts that a value is a ForecastPoint
 * @param value - Value to check
 * @throws Error if the value is not a ForecastPoint
 */
export function assertForecastPoint(value: unknown): asserts value is ForecastPoint {
  if (!isForecastPoint(value)) {
    throw new Error('Value is not a valid ForecastPoint');
  }
}

/**
 * Asserts that a value is WeatherData
 * @param value - Value to check
 * @throws Error if the value is not WeatherData
 */
export function assertWeatherData(value: unknown): asserts value is WeatherData {
  if (!isWeatherData(value)) {
    throw new Error('Value is not a valid WeatherData');
  }
}

/**
 * Asserts that a value is a RoutePoint
 * @param value - Value to check
 * @throws Error if the value is not a RoutePoint
 */
export function assertRoutePoint(value: unknown): asserts value is RoutePoint {
  if (!isRoutePoint(value)) {
    throw new Error('Value is not a valid RoutePoint');
  }
}

/**
 * Asserts that a value is GPXData
 * @param value - Value to check
 * @throws Error if the value is not GPXData
 */
export function assertGPXData(value: unknown): asserts value is GPXData {
  if (!isGPXData(value)) {
    throw new Error('Value is not a valid GPXData');
  }
}
