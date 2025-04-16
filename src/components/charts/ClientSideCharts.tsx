'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { cn } from '@/lib/utils';
import { animation, effects } from '@/styles/tailwind-utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import dynamic from 'next/dynamic';

// Dynamically import the SafeChartsWrapper component
const SafeChartsWrapper = dynamic(() => import('./SafeChartsWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center">
      <LoadingSpinner size="lg" />
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
  /** Additional class names */
  className?: string;
  /** Height class for the container */
  height?: string;
}

/**
 * A client-side only wrapper for the charts component
 */
export const ClientSideCharts: React.FC<ClientSideChartsProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  className,
  height = 'h-[800px]',
}) => {
  // Check if we have valid data
  if (!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) {
    return (
      <div className={cn(height, effects.rounded, 'relative overflow-hidden bg-transparent', animation.fadeIn, className)}>
        <ErrorMessage
          title="No Data Available"
          message="Please upload a GPX file and generate a forecast to view charts."
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
    <div className={cn(height, effects.rounded, 'relative overflow-hidden bg-transparent pb-8', animation.fadeIn, className)}>
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
