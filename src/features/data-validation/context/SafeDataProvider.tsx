'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Import from features
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { SafeDataContextType } from '../types';
import {
  validateGPXData as validateGPXDataWithZod,
  validateForecastPoints as validateForecastPointsWithZod,
  validateWeatherDataArray,
  validateWithSchema,
} from '../utils/validation';
import { forecastPointSchema } from '../utils/schemas';

/**
 * Context for safe data validation
 */
const SafeDataContext = createContext<SafeDataContextType | undefined>(undefined);

/**
 * Provider component for safe data validation
 * @param children - React children
 * @returns Provider component
 */
export function SafeDataProvider({ children }: { children: ReactNode }): React.ReactElement {
  /**
   * Validate GPX data using Zod schema
   * @param data - GPX data to validate
   * @returns Validated GPX data or null
   */
  const validateGPXData = (data: GPXData | null): GPXData | null => {
    if (!data) return null;

    // Use Zod schema validation
    const result: ValidationResult<GPXData> = validateGPXDataWithZod(data);

    if (result.isValid && result.data) {
      return result.data;
    }

    // If validation failed, log errors and return a safe default
    console.error('Invalid GPX data:', result.errors);

    // Return a safe version of the data
    return {
      ...data,
      points: data.points?.filter(point => validatePoint(point)) || [],
      totalDistance: data.totalDistance || 0,
      elevationGain: data.elevationGain || 0,
      elevationLoss: data.elevationLoss || 0,
      maxElevation: data.maxElevation || 0,
      minElevation: data.minElevation || 0,
    };
  };

  /**
   * Validate forecast points using Zod schema
   * @param points - Forecast points to validate
   * @returns Validated forecast points
   */
  const validateForecastPoints = (points: ForecastPoint[]): ForecastPoint[] => {
    if (!points || !Array.isArray(points)) {
      console.error('Invalid forecast points: not an array');
      return [];
    }

    // Use Zod schema validation
    const result: ValidationResult<ForecastPoint[]> = validateForecastPointsWithZod(points);

    if (result.isValid && result.data) {
      return result.data;
    }

    // If validation failed, log errors and filter out invalid points
    console.error('Invalid forecast points:', result.errors);
    return points.filter(point => validatePoint(point));
  };

  /**
   * Validate weather data using Zod schema
   * @param data - Weather data to validate
   * @returns Validated weather data
   */
  const validateWeatherData = (data: (WeatherData | null)[]): (WeatherData | null)[] => {
    if (!data || !Array.isArray(data)) {
      console.error('Invalid weather data: not an array');
      return [];
    }

    // Use Zod schema validation
    const result: ValidationResult<(WeatherData | null)[]> = validateWeatherDataArray(data);

    if (result.isValid && result.data) {
      return result.data;
    }

    // If validation failed, log errors and return a safe version of the data
    console.error('Invalid weather data:', result.errors);

    // Filter out null entries and ensure all required properties exist
    return data.map(item => {
      if (!item) return null;

      // Ensure all required properties exist with correct types
      const validItem: WeatherData = { ...item };

      // Ensure numeric properties
      [
        'temperature',
        'feelsLike',
        'humidity',
        'pressure',
        'windSpeed',
        'rain',
        'snow',
        'uvIndex',
      ].forEach(prop => {
        if (
          typeof validItem[prop as keyof WeatherData] !== 'number' ||
          isNaN(validItem[prop as keyof WeatherData] as number)
        ) {
          (validItem as Record<string, number>)[prop] = 0;
        }
      });

      // Ensure string properties
      ['weatherDescription', 'weatherIcon', 'windDirection'].forEach(prop => {
        if (typeof validItem[prop as keyof WeatherData] !== 'string') {
          (validItem as Record<string, string>)[prop] = '';
        }
      });

      return validItem;
    });
  };

  /**
   * Validate a single forecast point
   * @param point - Forecast point to validate
   * @returns True if the point is valid, false otherwise
   */
  const validatePoint = (point: Partial<ForecastPoint>): boolean => {
    // Use Zod schema for validation
    const result: ValidationResult<Partial<ForecastPoint>> = validateWithSchema(
      point,
      forecastPointSchema.partial()
    );
    return result.isValid;
  };

  /**
   * Create the context value with validation functions
   */
  const contextValue: SafeDataContextType = {
    validateGPXData,
    validateForecastPoints,
    validateWeatherData,
    validatePoint,
  };

  return <SafeDataContext.Provider value={contextValue}>{children}</SafeDataContext.Provider>;
}

/**
 * Hook to use the safe data validation context
 * @returns Safe data validation context
 */
export function useSafeData(): SafeDataContextType {
  const context: SafeDataContextType | undefined = useContext(SafeDataContext);
  if (context === undefined) {
    throw new Error('useSafeData must be used within a SafeDataProvider');
  }
  return context;
}
