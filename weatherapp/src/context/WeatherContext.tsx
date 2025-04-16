'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { GPXData, ForecastPoint, RoutePoint } from '@shared/types/gpx-types';
import { generateForecastPoints } from '@shared/utils/gpxParser';
import { WeatherData, normalizeWeatherData } from '@shared/types/weather-types';
import { RouteSettings } from '@/types';
import { fetchWeatherForPoints } from '@/lib/mongodb-api';
import { captureException, captureMessage } from '@/lib/sentry';
import { useNotifications } from '@/hooks/useNotifications';
import { useSafeData } from '@/hooks/useSafeData';

/**
 * Weather context state and methods
 */
interface WeatherContextType {
  // State
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  isLoading: boolean;
  isGenerating: boolean;
  isExporting: boolean;
  error: Error | null;
  loadingMessage: string;

  // Actions
  setGpxData: (data: GPXData | null) => void;
  setForecastPoints: (points: ForecastPoint[]) => void;
  setWeatherData: (data: (WeatherData | null)[]) => void;
  setSelectedMarker: (index: number | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  generateWeatherForecast: (weatherInterval: number, startTime: Date, avgSpeed: number) => Promise<void>;
  setIsExporting: (isExporting: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

// Create context with undefined default value
const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

/**
 * Weather Provider component that manages weather data state and operations
 */
export function WeatherProvider({ children }: { children: ReactNode }) {
  // State for route and weather data
  const [gpxData, setGpxDataInternal] = useState<GPXData | null>(null);
  const [forecastPoints, setForecastPointsInternal] = useState<ForecastPoint[]>([]);
  const [weatherData, setWeatherDataInternal] = useState<(WeatherData | null)[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Hooks
  const { addNotification } = useNotifications();
  const { validateGPXData, validateForecastPoints, validateWeatherData } = useSafeData();

  /**
   * Set GPX data with validation
   */
  const setGpxData = useCallback((data: GPXData | null) => {
    setGpxDataInternal(validateGPXData(data));
  }, [validateGPXData]);

  /**
   * Set forecast points with validation
   */
  const setForecastPoints = useCallback((points: ForecastPoint[]) => {
    setForecastPointsInternal(validateForecastPoints(points));
  }, [validateForecastPoints]);

  /**
   * Set weather data with validation
   */
  const setWeatherData = useCallback((data: (WeatherData | null)[]) => {
    setWeatherDataInternal(validateWeatherData(data));
  }, [validateWeatherData]);

  /**
   * Handle errors and report to monitoring
   */
  const handleError = useCallback((error: unknown, context: string, extraData?: Record<string, any>) => {
    let errorMessage = 'An unexpected error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
      setError(error);
      captureException(error, {
        context,
        ...extraData,
        timestamp: new Date().toISOString()
      });
    } else {
      const unknownError = new Error(`Unknown error in ${context}`);
      captureException(unknownError, {
        context,
        originalError: error,
        ...extraData
      });
    }

    addNotification('error', errorMessage);
    console.error(`Error in ${context}:`, error);
    return errorMessage;
  }, [addNotification]);

  /**
   * Generate weather forecast for the route
   */
  const generateWeatherForecast = useCallback(async (
    weatherInterval: number,
    startTime: Date,
    avgSpeed: number
  ) => {
    if (!gpxData) {
      addNotification('error', 'Please upload a GPX file first');
      return;
    }

    // Reset state and start loading
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

      setForecastPoints(points);
      setLoadingMessage(`Fetching weather data for ${points.length} points...`);

      try {
        // Fetch weather data for each point
        const data = await fetchWeatherForPoints(points);

        // Validate the response
        const hasValidData = data.some(item => item !== null);
        if (!hasValidData) {
          throw new Error('Failed to fetch weather data. Please try again later.');
        }

        // Update state with the fetched data
        setWeatherData(data);
        addNotification('success', 'Weather forecast generated successfully');
        captureMessage('Weather forecast generated successfully', 'info');
      } catch (error) {
        // Handle API errors
        handleError(error, 'fetchWeatherForPoints', { points: points.length });
      }
    } catch (error) {
      // Handle GPX processing errors
      handleError(error, 'generateForecastPoints', { weatherInterval, avgSpeed });
    } finally {
      // Reset loading state
      setIsGenerating(false);
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [gpxData, addNotification, setForecastPoints, setWeatherData, handleError]);

  // Reset state when GPX data changes
  useEffect(() => {
    if (gpxData) {
      setForecastPoints([]);
      setWeatherData([]);
      setSelectedMarker(null);
      setError(null);
    }
  }, [gpxData, setForecastPoints, setWeatherData]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
    setGpxData,
    setForecastPoints,
    setWeatherData,
    setSelectedMarker,
    setIsLoading,
    setError,
    generateWeatherForecast,
    setIsExporting,
    setLoadingMessage,
  }), [
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    isLoading,
    isGenerating,
    isExporting,
    error,
    loadingMessage,
    setGpxData,
    setForecastPoints,
    setWeatherData,
    setSelectedMarker,
    generateWeatherForecast
  ]);

  return <WeatherContext.Provider value={contextValue}>{children}</WeatherContext.Provider>;
}

/**
 * Hook to access the weather context
 * @throws Error if used outside of WeatherProvider
 */
export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
