'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GPXData, generateForecastPoints } from '@/utils/gpxParser';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { fetchWeatherForPoints } from '@/lib/mongodb-api';
import { captureException, captureMessage } from '@/lib/sentry';
import { useNotifications } from '@/components/NotificationProvider';

interface WeatherContextType {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  isLoading: boolean;
  isGenerating: boolean;
  isExporting: boolean;
  error: Error | null;
  loadingMessage: string;
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

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [gpxData, setGpxData] = useState<GPXData | null>(null);
  const [forecastPoints, setForecastPoints] = useState<ForecastPoint[]>([]);
  const [weatherData, setWeatherData] = useState<(WeatherData | null)[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Use the NotificationProvider
  const { addNotification } = useNotifications();

  // Generate weather forecast for the route
  const generateWeatherForecast = async (weatherInterval: number, startTime: Date, avgSpeed: number) => {
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

      setForecastPoints(points);
      setLoadingMessage(`Fetching weather data for ${points.length} points...`);

      // Fetch weather data for each point using client API
      try {
        const data = await fetchWeatherForPoints(points);

        // Check if we got data back
        const hasValidData = data.some(item => item !== null);
        if (!hasValidData) {
          throw new Error('Failed to fetch weather data. Please try again later.');
        }

        setWeatherData(data);
        addNotification('success', 'Weather forecast generated successfully');
        captureMessage('Weather forecast generated successfully', 'info');
      } catch (error) {
        // Handle network or API errors
        let errorMessage = 'Failed to fetch weather data';

        if (error instanceof Error) {
          errorMessage = error.message;
          setError(error);
          captureException(error, {
            context: 'fetchWeatherForPoints',
            points: points.length,
            timestamp: new Date().toISOString()
          });
        } else {
          captureException(new Error('Unknown error fetching weather data'), {
            context: 'fetchWeatherForPoints',
            originalError: error
          });
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
        captureException(error, {
          context: 'generateForecastPoints',
          weatherInterval,
          avgSpeed,
          timestamp: new Date().toISOString()
        });
      } else {
        captureException(new Error('Unknown error processing route data'), {
          context: 'generateForecastPoints',
          originalError: error
        });
      }

      addNotification('error', errorMessage);
      console.error('Error processing route:', error);
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Reset state when GPX data changes
  useEffect(() => {
    if (gpxData) {
      setForecastPoints([]);
      setWeatherData([]);
      setSelectedMarker(null);
      setError(null);
    }
  }, [gpxData]);

  const value = {
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
    setIsLoading,
    setError,
    generateWeatherForecast,
    setIsExporting,
    setLoadingMessage,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
