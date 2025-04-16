'use client';

/**
 * Custom hook for weather data management
 */
import { useState, useEffect, useCallback } from 'react';
import { generateForecastPoints } from '@shared/utils/gpxParser';
import { fetchWeatherForPoints } from '@/lib/mongodb-api';
import { useNotifications } from './useNotifications';
import { GPXData, ForecastPoint, ValidationError } from '@shared/types/gpx-types';
import { WeatherData, normalizeWeatherData } from '@shared/types/weather-types';

/**
 * Hook for managing weather data and forecast generation
 */
export function useWeather() {
  // State for GPX data and forecast points
  const [gpxData, setGpxData] = useState<GPXData | null>(null);
  const [forecastPoints, setForecastPoints] = useState<ForecastPoint[]>([]);
  const [weatherData, setWeatherData] = useState<(WeatherData | null)[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Use the notification hook
  const { addNotification } = useNotifications();

  /**
   * Validates GPX data to ensure it has the required properties
   */
  const validateGPXData = useCallback((data: GPXData | null): GPXData | null => {
    if (!data) return null;

    try {
      // Check required properties
      if (!data.points || !Array.isArray(data.points) || data.points.length === 0) {
        throw new ValidationError('Invalid GPX data: missing or empty points array');
      }

      // Check if points have required properties
      for (const point of data.points) {
        if (typeof point.lat !== 'number' || typeof point.lon !== 'number' ||
            typeof point.elevation !== 'number' || typeof point.distance !== 'number') {
          throw new ValidationError('Invalid GPX data: points must have lat, lon, elevation, and distance as numbers');
        }
      }

      // Check other required properties
      if (typeof data.totalDistance !== 'number' ||
          !data.elevation ||
          typeof data.elevation.gain !== 'number' ||
          typeof data.elevation.loss !== 'number' ||
          typeof data.elevation.max !== 'number' ||
          typeof data.elevation.min !== 'number') {
        throw new ValidationError('Invalid GPX data: missing required elevation properties');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        addNotification('error', error.message);
      }
      return null;
    }
  }, [addNotification]);

  /**
   * Validates forecast points to ensure they have the required properties
   */
  const validateForecastPoints = useCallback((points: ForecastPoint[]): ForecastPoint[] => {
    if (!points || !Array.isArray(points)) return [];

    try {
      const validPoints = points.filter(point => {
        return point &&
               typeof point.lat === 'number' &&
               typeof point.lon === 'number' &&
               typeof point.timestamp === 'number' &&
               typeof point.distance === 'number' &&
               point.lat >= -90 && point.lat <= 90 &&
               point.lon >= -180 && point.lon <= 180;
      });

      return validPoints;
    } catch (error) {
      return [];
    }
  }, []);

  /**
   * Validates weather data to ensure it has the required properties
   */
  const validateWeatherData = useCallback((data: (WeatherData | null)[]): (WeatherData | null)[] => {
    if (!data || !Array.isArray(data)) return [];

    try {
      return data.map(item => {
        if (!item) return null;

        // Check required properties
        if (typeof item.temperature !== 'number' ||
            typeof item.feelsLike !== 'number' ||
            typeof item.humidity !== 'number' ||
            typeof item.pressure !== 'number' ||
            typeof item.windSpeed !== 'number' ||
            typeof item.windDirection !== 'number') {
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
    } catch (error) {
      return [];
    }
  }, []);

  /**
   * Generates weather forecast for the route
   */
  const generateWeatherForecast = useCallback(async (
    weatherInterval: number,
    startTime: Date,
    avgSpeed: number
  ): Promise<void> => {
    if (!gpxData) {
      addNotification('error', 'Please upload a GPX file first');
      return;
    }

    setIsGenerating(true);
    setWeatherData([]);
    setForecastPoints([]);
    setSelectedMarker(null);
    setIsLoading(true);
    setLoadingMessage('Generating forecast points...');

    try {
      // Generate forecast points at intervals along the route
      const points = generateForecastPoints(
        gpxData,
        weatherInterval,
        startTime,
        avgSpeed
      );

      const validPoints = validateForecastPoints(points);
      setForecastPoints(validPoints);
      setLoadingMessage(`Fetching weather data for ${validPoints.length} points...`);

      // Fetch weather data for each point
      try {
        const data = await fetchWeatherForPoints(validPoints);

        // Check if we got data back
        const hasValidData = data.some(item => item !== null);
        if (!hasValidData) {
          throw new Error('Failed to fetch weather data. Please try again later.');
        }

        const validData = validateWeatherData(data);
        setWeatherData(validData);
        addNotification('success', 'Weather forecast generated successfully');
      } catch (error) {
        // Handle network or API errors
        let errorMessage = 'Failed to fetch weather data';

        if (error instanceof Error) {
          errorMessage = error.message;
          setError(error);
        }

        addNotification('error', errorMessage);
        console.error('Error fetching weather data:', error);
      }
    } catch (error) {
      // Handle GPX processing errors
      let errorMessage = 'Failed to process route data';

      if (error instanceof Error) {
        errorMessage = error.message;
        setError(error);
      }

      addNotification('error', errorMessage);
      console.error('Error processing route:', error);
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [gpxData, addNotification, validateForecastPoints, validateWeatherData]);

  // Reset state when GPX data changes
  useEffect(() => {
    if (gpxData) {
      setForecastPoints([]);
      setWeatherData([]);
      setSelectedMarker(null);
      setError(null);
    }
  }, [gpxData]);

  return {
    // State
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    isLoading,
    isGenerating,
    isExporting,
    error,
    loadingMessage,

    // Actions
    setGpxData: (data: GPXData | null) => setGpxData(validateGPXData(data)),
    setForecastPoints: (points: ForecastPoint[]) => setForecastPoints(validateForecastPoints(points)),
    setWeatherData: (data: (WeatherData | null)[]) => setWeatherData(validateWeatherData(data)),
    setSelectedMarker,
    setIsLoading,
    setError,
    generateWeatherForecast,
    setIsExporting,
    setLoadingMessage,
  };
}
