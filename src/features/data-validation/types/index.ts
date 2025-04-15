import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

/**
 * Interface for the SafeData context
 */
export interface SafeDataContextType {
  /**
   * Validates GPX data and ensures it has the required properties
   * @param data - The GPX data to validate
   * @returns Validated GPX data or null if invalid
   */
  validateGPXData: (data: GPXData | null) => GPXData | null;

  /**
   * Validates an array of forecast points
   * @param points - The forecast points to validate
   * @returns Array of valid forecast points
   */
  validateForecastPoints: (points: ForecastPoint[]) => ForecastPoint[];

  /**
   * Validates an array of weather data
   * @param data - The weather data to validate
   * @returns Array of validated weather data or null values
   */
  validateWeatherData: (data: (WeatherData | null)[]) => (WeatherData | null)[];

  /**
   * Validates a single forecast point
   * @param point - The point to validate
   * @returns True if the point is valid, false otherwise
   */
  validatePoint: (point: Partial<ForecastPoint>) => boolean;
}

/**
 * Type for validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Type for validation result
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data: T | null;
  errors: ValidationError[];
}
