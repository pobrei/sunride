'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, LineChart } from 'lucide-react';
import { cn } from '@/styles/tailwind-utils';

// Dynamically import the Charts component with no SSR
const SafeChartsWrapper = dynamic(() => import('./SafeChartsWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-muted/30 flex items-center justify-center rounded-lg border border-border">
      <LoadingSpinner
        message="Loading chart components..."
        centered
        variant="skeleton"
        withContainer
        size="lg"
      />
    </div>
  ),
});

interface ClientSideChartsProps {
  /** GPX data containing route points */
  gpxData: GPXData | null;
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Callback when a chart point is clicked */
  onChartClick: (index: number) => void;
  /** Optional className for styling */
  className?: string;
  /** Optional height for the charts */
  height?: string;
  /** Whether to show a placeholder when no data is available */
  showPlaceholder?: boolean;
}

export const ClientSideCharts: React.FC<ClientSideChartsProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  className,
  height = "h-[300px]",
  showPlaceholder = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulate charts initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Handle errors
  useEffect(() => {
    try {
      // Validate data
      if (forecastPoints && weatherData && forecastPoints.length !== weatherData.length) {
        throw new Error('Forecast points and weather data length mismatch');
      }
    } catch (error) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [forecastPoints, weatherData]);

  // If there's no data, show a placeholder
  if ((!gpxData || !forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) && showPlaceholder) {
    return (
      <Card className={cn(height, 'overflow-hidden', className)}>
        <CardContent className="p-0 h-full">
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Chart Data</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload a GPX file to visualize weather data in charts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there's an error, show an error message
  if (hasError) {
    return (
      <div className={cn(height, 'overflow-hidden rounded-lg', className)}>
        <ErrorMessage
          title="Chart Error"
          message={errorMessage || 'Failed to load the chart component'}
          severity="warning"
          withContainer
          className="h-full"
          size="sm"
        />
      </div>
    );
  }

  // If everything is fine, render the charts
  return (
    <div className={cn(height, 'relative rounded-lg overflow-hidden', className)}>
      <SafeChartsWrapper
        gpxData={gpxData}
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />
    </div>
  );
};
