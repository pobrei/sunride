'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { cn } from '@/lib/utils';
import { effects, responsive } from '@/styles/tailwind-utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import dynamic from 'next/dynamic';

// Dynamically import the SafeChartsWrapper component
const SafeChartsWrapper = dynamic(() => import('./SafeChartsWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] flex items-center justify-center">
      <LoadingSpinner size="lg" variant="train" />
    </div>
  ),
});

export interface ClientSideChartsProps {
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
const ClientSideCharts: React.FC<ClientSideChartsProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  className,
  height = 'h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]',
}) => {
  // Check if we have valid data
  if (!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) {
    return (
      <div className={cn(height, effects.rounded, 'relative overflow-hidden bg-transparent flex items-center justify-center', className)}>
        <div className="text-center p-4">
          <p className="text-zinc-500 mb-2">No data available</p>
          <p className="text-sm text-zinc-400">Please upload a GPX file and generate a forecast to view charts.</p>
        </div>
      </div>
    );
  }

  // If everything is fine, render the charts
  return (
    <div className={cn(height, effects.rounded, 'relative overflow-hidden bg-transparent w-full max-w-full', className)}>
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

export default ClientSideCharts;
