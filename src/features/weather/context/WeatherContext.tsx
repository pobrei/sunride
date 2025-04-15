'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateForecastPoints } from '@/utils/gpxParser';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { fetchWeatherForPoints } from '@/lib/mongodb-api';
import { captureException, captureMessage } from '@/lib/sentry';
import { useNotifications } from '@/features/notifications/context';
import { useSafeData } from '@/features/data-validation/context';

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
  generateWeatherForecast: (
    weatherInterval: number,
    startTime: Date,
    avgSpeed: number
  ) => Promise<void>;
  setIsExporting: (isExporting: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

/**
 * Provider component for weather data
 * @param children - Child components
 * @returns Weather provider component
 */
export function WeatherProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [gpxData, setGpxDataInternal] = useState<GPXData | null>(null);
  const [forecastPoints, setForecastPointsInternal] = useState<ForecastPoint[]>([]);
  const [weatherData, setWeatherDataInternal] = useState<(WeatherData | null)[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Use the NotificationProvider
  const { addNotification } = useNotifications();

  // Use the SafeDataProvider
  const { validateGPXData, validateForecastPoints, validateWeatherData } = useSafeData();

  // Wrap the state setters with validation
  const setGpxData = (data: GPXData | null): void => {
    setGpxDataInternal(validateGPXData(data));
  };

  const setForecastPoints = (points: ForecastPoint[]): void => {
    setForecastPointsInternal(validateForecastPoints(points));
  };

  const setWeatherData = (data: (WeatherData | null)[]): void => {
    setWeatherDataInternal(validateWeatherData(data));
  };

  /**
   * Generate weather forecast for the route
   * @param weatherInterval - Distance between forecast points in kilometers
   * @param startTime - Start time for the forecast
   * @param avgSpeed - Average speed in km/h
   * @returns Promise that resolves when forecast is generated
   */
  const generateWeatherForecast = async (
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
      const points = generateForecastPoints(gpxData, weatherInterval, startTime, avgSpeed);

      setForecastPoints(points);
      setLoadingMessage(`Fetching weather data for ${points.length} points...`);

      // Fetch weather data for each point using client API
      try {
        console.log('Sending points to fetchWeatherForPoints:', points);
        const data = await fetchWeatherForPoints(points);

        // Log the received data for debugging
        console.log(
          `Received weather data: ${data.length} points, ${data.filter(item => item !== null).length} valid points`
        );
        console.log('Weather data sample:', data[0]);

        // Only check for valid data if we have points to check
        if (data.length > 0) {
          const hasValidData = data.some(item => item !== null);
          if (!hasValidData) {
            console.warn('All weather data points are null, using fallback data');
            // Generate mock data instead of using null values
            const mockData = points.map((point, index) => {
              // Use the point's timestamp to create time-based variations
              const date = new Date(point.timestamp * 1000);
              const hour = date.getHours();

              // UV index varies by time of day (higher at noon)
              const uvIndex = Math.max(0, Math.min(11, Math.floor((6 - Math.abs(hour - 12)) * 1.5)));

              // Humidity varies by time (higher in morning and evening)
              const humidity = 50 + Math.floor(Math.sin(hour / 24 * Math.PI * 2) * 20) + Math.floor(Math.random() * 10);

              // Pressure varies slightly throughout the day
              const pressure = 1013 + Math.floor(Math.sin(hour / 24 * Math.PI * 2) * 5) + Math.floor(Math.random() * 5);

              return {
                temperature: 15 + Math.sin(point.lat * 10) * 10,
                feelsLike: 15 + Math.sin(point.lat * 10) * 8,
                humidity: humidity,
                pressure: pressure,
                windSpeed: 5 + Math.random() * 10,
                windDirection: Math.floor(Math.random() * 360),
                rain: Math.random() < 0.3 ? Math.random() * 5 : 0,
                weatherIcon: '01d',
                weatherDescription: 'clear sky',
                uvIndex: uvIndex,
                windGust: 8 + Math.random() * 10,
                precipitationProbability: Math.random(),
                precipitation: Math.random() < 0.3 ? Math.random() * 5 : 0,
                snow: 0
              };
            });
            setWeatherData(mockData);
            addNotification('warning', 'Weather data unavailable. Using simulated data for display.');
            return;
          }
        } else {
          console.warn('Received empty weather data array');
          setWeatherData([]);
          setLoadingMessage(
            'No weather data available. Please check your OpenWeather API key in .env.local file.'
          );
          setIsLoading(false);
          return;
        }

        setWeatherData(data);

        // Only show success if we have some valid data points
        const validPointsCount = data.filter(item => item !== null).length;
        if (validPointsCount > 0) {
          addNotification('success', `Weather forecast generated with ${validPointsCount} data points`);
          captureMessage('Weather forecast generated successfully', 'info');
        } else {
          addNotification('warning', 'Weather data unavailable. Using fallback display.');
          captureMessage('Weather forecast generated with fallback data', 'warning');
        }
      } catch (error) {
        // Handle network or API errors
        let errorMessage = 'Failed to fetch weather data';

        if (error instanceof Error) {
          errorMessage = error.message;
          setError(error);
          captureException(error, {
            context: 'fetchWeatherForPoints',
            points: points.length,
            timestamp: new Date().toISOString(),
          });
        } else {
          captureException(new Error('Unknown error fetching weather data'), {
            context: 'fetchWeatherForPoints',
            originalError: error,
          });
        }

        // Generate mock data instead of using null values
        const mockData = points.map((point, index) => {
          // Use the point's timestamp to create time-based variations
          const date = new Date(point.timestamp * 1000);
          const hour = date.getHours();

          // UV index varies by time of day (higher at noon)
          const uvIndex = Math.max(0, Math.min(11, Math.floor((6 - Math.abs(hour - 12)) * 1.5)));

          // Humidity varies by time (higher in morning and evening)
          const humidity = 50 + Math.floor(Math.sin(hour / 24 * Math.PI * 2) * 20) + Math.floor(Math.random() * 10);

          // Pressure varies slightly throughout the day
          const pressure = 1013 + Math.floor(Math.sin(hour / 24 * Math.PI * 2) * 5) + Math.floor(Math.random() * 5);

          return {
            temperature: 15 + Math.sin(point.lat * 10) * 10,
            feelsLike: 15 + Math.sin(point.lat * 10) * 8,
            humidity: humidity,
            pressure: pressure,
            windSpeed: 5 + Math.random() * 10,
            windDirection: Math.floor(Math.random() * 360),
            rain: Math.random() < 0.3 ? Math.random() * 5 : 0,
            weatherIcon: '01d',
            weatherDescription: 'clear sky',
            uvIndex: uvIndex,
            windGust: 8 + Math.random() * 10,
            precipitationProbability: Math.random(),
            precipitation: Math.random() < 0.3 ? Math.random() * 5 : 0,
            snow: 0
          };
        });
        setWeatherData(mockData);
        addNotification('warning', 'Error fetching weather data. Using simulated data for display.');
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
          timestamp: new Date().toISOString(),
        });
      } else {
        captureException(new Error('Unknown error processing route data'), {
          context: 'generateForecastPoints',
          originalError: error,
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

  const value: WeatherContextType = {
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

/**
 * Hook to access the weather context
 * @returns Weather context with weather data and methods
 */
export function useWeather(): WeatherContextType {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
