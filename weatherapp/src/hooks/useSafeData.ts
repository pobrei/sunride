'use client';

/**
 * Custom hook for data validation
 */
import { GPXData, ForecastPoint, RoutePoint, normalizeGPXData } from '@shared/types/gpx-types';
import { WeatherData, normalizeWeatherData } from '@shared/types/weather-types';

/**
 * Hook for validating data structures
 */
export function useSafeData() {
  /**
   * Validate GPX data
   */
  const validateGPXData = (data: GPXData | null): GPXData | null => {
    if (!data) return null;

    // Ensure points array exists and is valid
    if (!data.points || !Array.isArray(data.points)) {
      console.error('Invalid GPX data: points array is missing or not an array');
      return normalizeGPXData({
        name: data.name || 'Unnamed Route',
        points: [],
        tracks: [],
        totalDistance: 0,
        elevation: {
          gain: 0,
          loss: 0,
          max: 0,
          min: 0
        }
      });
    }

    // Validate each point
    const validPoints = data.points.filter(point => validatePoint(point));

    if (validPoints.length !== data.points.length) {
      console.error(`Invalid GPX data: ${data.points.length - validPoints.length} points were invalid and removed`);
    }

    // Create a normalized version of the data with the valid points
    const validData = {
      ...data,
      points: validPoints,
      // Recalculate totals if points were filtered out
      totalDistance: validPoints.length > 0 ?
        (validPoints[validPoints.length - 1] as any).distance || 0 : 0
    };

    return normalizeGPXData(validData);
  };

  /**
   * Validate forecast points
   */
  const validateForecastPoints = (points: ForecastPoint[]): ForecastPoint[] => {
    if (!points || !Array.isArray(points)) {
      console.error('Invalid forecast points: not an array');
      return [];
    }

    return points.filter(point => {
      if (!point || typeof point !== 'object') {
        console.error('Invalid forecast point: not an object', point);
        return false;
      }

      if (typeof point.lat !== 'number' ||
          typeof point.lon !== 'number' ||
          typeof point.timestamp !== 'number' ||
          typeof point.distance !== 'number') {
        console.error('Invalid forecast point: missing required properties', point);
        return false;
      }

      if (point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180) {
        console.error('Invalid forecast point: coordinates out of range', point);
        return false;
      }

      return true;
    });
  };

  /**
   * Validate weather data
   */
  const validateWeatherData = (data: (WeatherData | null)[]): (WeatherData | null)[] => {
    if (!data || !Array.isArray(data)) {
      console.error('Invalid weather data: not an array');
      return [];
    }

    return data.map(item => {
      if (!item) return null;

      if (typeof item !== 'object') {
        console.error('Invalid weather data item: not an object', item);
        return null;
      }

      // Check required properties
      if (typeof item.temperature !== 'number' ||
          typeof item.feelsLike !== 'number' ||
          typeof item.humidity !== 'number' ||
          typeof item.pressure !== 'number' ||
          typeof item.windSpeed !== 'number' ||
          typeof item.windDirection !== 'number') {
        console.error('Invalid weather data item: missing required properties', item);
        return null;
      }

      try {
        // Normalize the weather data to ensure all required properties exist
        return normalizeWeatherData(item);
      } catch (error) {
        console.error('Error normalizing weather data:', error);
        return null;
      }
    });
  };

  /**
   * Validate a single point
   */
  const validatePoint = (point: any): boolean => {
    if (!point || typeof point !== 'object') {
      return false;
    }

    if (typeof point.lat !== 'number' ||
        typeof point.lon !== 'number' ||
        typeof point.distance !== 'number') {
      return false;
    }

    if (point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180) {
      return false;
    }

    return true;
  };

  return {
    validateGPXData,
    validateForecastPoints,
    validateWeatherData,
    validatePoint
  };
}
