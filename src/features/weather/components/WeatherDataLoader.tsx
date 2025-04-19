'use client';

import React, { useState, useEffect } from 'react';
import { WeatherFallbackUI, WeatherWidgetFallback } from './WeatherFallbackUI';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeatherContext } from '@/features/weather/context/WeatherContext';

interface WeatherDataLoaderProps {
  /** The component to render when data is loaded successfully */
  children: React.ReactNode;
  /** Whether to show a compact fallback UI */
  compact?: boolean;
  /** Whether to automatically retry loading on error */
  autoRetry?: boolean;
  /** Maximum number of auto-retries */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Component that handles loading states and errors for weather data
 */
export function WeatherDataLoader({
  children,
  compact = false,
  autoRetry = true,
  maxRetries = 3,
  retryDelay = 5000,
  className = '',
}: WeatherDataLoaderProps) {
  const { isLoading, error, weatherData, generateForecast } = useWeatherContext();
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState<NodeJS.Timeout | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [retryTimer]);

  // Handle auto-retry
  useEffect(() => {
    if (error && autoRetry && retryCount < maxRetries && !retryTimer) {
      const timer = setTimeout(() => {
        handleRetry();
      }, retryDelay);

      setRetryTimer(timer);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [error, autoRetry, retryCount, maxRetries, retryDelay]);

  // Handle manual retry
  const handleRetry = () => {
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }

    setRetryCount(prev => prev + 1);
    generateForecast();
  };

  // Show loading state
  if (isLoading) {
    return compact ? (
      <div className={`p-3 ${className}`}>
        <Skeleton className="h-24 w-full" />
      </div>
    ) : (
      <div className={`p-4 space-y-4 ${className}`}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Show error state
  if (error || !weatherData) {
    return compact ? (
      <WeatherWidgetFallback error={error} onRetry={handleRetry} />
    ) : (
      <WeatherFallbackUI
        error={error}
        onRetry={handleRetry}
        fullSize={true}
        className={className}
      />
    );
  }

  // Show children when data is loaded
  return <>{children}</>;
}
