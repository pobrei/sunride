'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { GPXData, RoutePoint } from '@/utils/gpxParser';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';

// Define the context type
interface SafeDataContextType {
  validateGPXData: (data: GPXData | null) => GPXData | null;
  validateForecastPoints: (points: ForecastPoint[]) => ForecastPoint[];
  validateWeatherData: (data: (WeatherData | null)[]) => (WeatherData | null)[];
  validatePoint: (point: any) => boolean;
}

// Create the context
const SafeDataContext = createContext<SafeDataContextType | undefined>(undefined);

// Provider component
export function SafeDataProvider({ children }: { children: ReactNode }) {
  // Validate GPX data
  const validateGPXData = (data: GPXData | null): GPXData | null => {
    if (!data) return null;
    
    // Ensure points array exists and is valid
    if (!data.points || !Array.isArray(data.points)) {
      console.error('Invalid GPX data: points array is missing or not an array');
      return {
        ...data,
        points: [],
        totalDistance: 0,
        elevationGain: 0,
        elevationLoss: 0,
        maxElevation: 0,
        minElevation: 0
      };
    }
    
    // Filter out invalid points
    const validPoints = data.points.filter(point => 
      point && 
      typeof point.lat === 'number' && 
      typeof point.lon === 'number' && 
      !isNaN(point.lat) && 
      !isNaN(point.lon) &&
      point.lat >= -90 && 
      point.lat <= 90 && 
      point.lon >= -180 && 
      point.lon <= 180
    );
    
    if (validPoints.length === 0) {
      console.error('Invalid GPX data: no valid points found');
    }
    
    return {
      ...data,
      points: validPoints,
      totalDistance: validPoints.length > 0 ? data.totalDistance : 0,
      elevationGain: validPoints.length > 0 ? data.elevationGain : 0,
      elevationLoss: validPoints.length > 0 ? data.elevationLoss : 0,
      maxElevation: validPoints.length > 0 ? data.maxElevation : 0,
      minElevation: validPoints.length > 0 ? data.minElevation : 0
    };
  };
  
  // Validate forecast points
  const validateForecastPoints = (points: ForecastPoint[]): ForecastPoint[] => {
    if (!points || !Array.isArray(points)) {
      console.error('Invalid forecast points: not an array');
      return [];
    }
    
    // Filter out invalid points
    return points.filter(point => validatePoint(point));
  };
  
  // Validate weather data
  const validateWeatherData = (data: (WeatherData | null)[]): (WeatherData | null)[] => {
    if (!data || !Array.isArray(data)) {
      console.error('Invalid weather data: not an array');
      return [];
    }
    
    // Filter out null entries and ensure all required properties exist
    return data.map(item => {
      if (!item) return null;
      
      // Ensure all required properties exist with correct types
      const validItem = { ...item };
      
      // Ensure numeric properties
      ['temperature', 'feelsLike', 'humidity', 'pressure', 'windSpeed', 'rain', 'snow', 'uvIndex'].forEach(prop => {
        if (typeof validItem[prop as keyof WeatherData] !== 'number' || isNaN(validItem[prop as keyof WeatherData] as number)) {
          (validItem as any)[prop] = 0;
        }
      });
      
      // Ensure string properties
      ['weatherDescription', 'weatherIcon', 'windDirection'].forEach(prop => {
        if (typeof validItem[prop as keyof WeatherData] !== 'string') {
          (validItem as any)[prop] = '';
        }
      });
      
      return validItem;
    });
  };
  
  // Validate a single point
  const validatePoint = (point: any): boolean => {
    return (
      point && 
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
  };
  
  // Create the context value
  const contextValue: SafeDataContextType = {
    validateGPXData,
    validateForecastPoints,
    validateWeatherData,
    validatePoint
  };
  
  return (
    <SafeDataContext.Provider value={contextValue}>
      {children}
    </SafeDataContext.Provider>
  );
}

// Hook to use the context
export function useSafeData() {
  const context = useContext(SafeDataContext);
  if (context === undefined) {
    throw new Error('useSafeData must be used within a SafeDataProvider');
  }
  return context;
}
