import { z } from 'zod';
import { ValidationResult, ValidationError } from '@/types/utility-types';
import * as schemas from './schemas';

/**
 * Validates data against a Zod schema
 * 
 * @template T - The type of the validated data
 * @param data - The data to validate
 * @param schema - The Zod schema to validate against
 * @returns A validation result
 */
export function validateWithSchema<T>(data: unknown, schema: z.ZodType<T>): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return {
      isValid: true,
      data: validData,
      errors: []
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.input
      }));
      
      return {
        isValid: false,
        data: null,
        errors
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: [{
        field: 'unknown',
        message: error instanceof Error ? error.message : 'Unknown validation error'
      }]
    };
  }
}

/**
 * Validates GPX data
 * 
 * @param data - The GPX data to validate
 * @returns A validation result
 */
export function validateGPXData(data: unknown): ValidationResult<schemas.GPXData> {
  return validateWithSchema(data, schemas.gpxDataSchema);
}

/**
 * Validates a forecast point
 * 
 * @param data - The forecast point to validate
 * @returns A validation result
 */
export function validateForecastPoint(data: unknown): ValidationResult<schemas.ForecastPoint> {
  return validateWithSchema(data, schemas.forecastPointSchema);
}

/**
 * Validates an array of forecast points
 * 
 * @param data - The forecast points to validate
 * @returns A validation result
 */
export function validateForecastPoints(data: unknown): ValidationResult<schemas.ForecastPoint[]> {
  return validateWithSchema(data, z.array(schemas.forecastPointSchema));
}

/**
 * Validates weather data
 * 
 * @param data - The weather data to validate
 * @returns A validation result
 */
export function validateWeatherData(data: unknown): ValidationResult<schemas.WeatherData> {
  return validateWithSchema(data, schemas.weatherDataSchema);
}

/**
 * Validates an array of weather data
 * 
 * @param data - The weather data array to validate
 * @returns A validation result
 */
export function validateWeatherDataArray(data: unknown): ValidationResult<(schemas.WeatherData | null)[]> {
  return validateWithSchema(data, z.array(z.union([schemas.weatherDataSchema, z.null()])));
}

/**
 * Validates route settings
 * 
 * @param data - The route settings to validate
 * @returns A validation result
 */
export function validateRouteSettings(data: unknown): ValidationResult<schemas.RouteSettings> {
  return validateWithSchema(data, schemas.routeSettingsSchema);
}

/**
 * Validates route metrics
 * 
 * @param data - The route metrics to validate
 * @returns A validation result
 */
export function validateRouteMetrics(data: unknown): ValidationResult<schemas.RouteMetrics> {
  return validateWithSchema(data, schemas.routeMetricsSchema);
}

/**
 * Validates a notification
 * 
 * @param data - The notification to validate
 * @returns A validation result
 */
export function validateNotification(data: unknown): ValidationResult<schemas.Notification> {
  return validateWithSchema(data, schemas.notificationSchema);
}

/**
 * Validates map viewport
 * 
 * @param data - The map viewport to validate
 * @returns A validation result
 */
export function validateMapViewport(data: unknown): ValidationResult<schemas.MapViewport> {
  return validateWithSchema(data, schemas.mapViewportSchema);
}

/**
 * Validates a map marker
 * 
 * @param data - The map marker to validate
 * @returns A validation result
 */
export function validateMapMarker(data: unknown): ValidationResult<schemas.MapMarker> {
  return validateWithSchema(data, schemas.mapMarkerSchema);
}

/**
 * Validates a map layer
 * 
 * @param data - The map layer to validate
 * @returns A validation result
 */
export function validateMapLayer(data: unknown): ValidationResult<schemas.MapLayer> {
  return validateWithSchema(data, schemas.mapLayerSchema);
}

/**
 * Validates an export format
 * 
 * @param data - The export format to validate
 * @returns A validation result
 */
export function validateExportFormat(data: unknown): ValidationResult<schemas.ExportFormat> {
  return validateWithSchema(data, schemas.exportFormatSchema);
}

/**
 * Validates a weather provider
 * 
 * @param data - The weather provider to validate
 * @returns A validation result
 */
export function validateWeatherProvider(data: unknown): ValidationResult<schemas.WeatherProvider> {
  return validateWithSchema(data, schemas.weatherProviderSchema);
}
