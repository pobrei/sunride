'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { Charts } from './Charts';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { cn } from '@/lib/utils';
import { typography, animation, effects } from '@/styles/tailwind-utils';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafeChartsWrapperProps {
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
}

/**
 * A wrapper component that safely renders the Charts component
 * with error handling and loading states
 */
const SafeChartsWrapper: React.FC<SafeChartsWrapperProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  // Validate data
  const hasValidData =
    forecastPoints &&
    weatherData &&
    forecastPoints.length > 0 &&
    weatherData.length > 0 &&
    forecastPoints.length === weatherData.length;

  if (!hasValidData) {
    return (
      <div className={cn("relative rounded-xl overflow-hidden border border-border bg-transparent p-4 max-w-7xl mx-auto", animation.fadeIn)}>
        <div className={cn("flex flex-col items-center justify-center text-center", animation.fadeInSlideUp)}>
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className={cn("text-lg font-semibold mb-4")}>Chart Data Error</h3>
          <p className={cn("text-base text-zinc-700 mb-4")}>
            We couldn't display the charts because the data is invalid or incomplete.
          </p>
          <div className={cn("text-sm text-zinc-500 mb-4")}>
            <p>Please try the following:</p>
            <ul className="list-disc text-left pl-5 mt-2">
              <li>Upload a different GPX file</li>
              <li>Check if the GPX file contains valid elevation data</li>
              <li>Refresh the page and try again</li>
            </ul>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full max-w-xs">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="pb-8 overflow-visible max-w-7xl mx-auto px-4">
        <Charts
          gpxData={gpxData}
          forecastPoints={forecastPoints}
          weatherData={weatherData}
          selectedMarker={selectedMarker}
          onChartClick={onChartClick}
        />
        {/* Spacer moved outside of chart container to avoid interference */}
        <div className="h-16 mt-8" />
      </div>
    );
  } catch (error) {
    console.error('Error rendering charts:', error);
    return (
      <div className={cn("h-full flex items-center justify-center", animation.fadeIn)}>
        <ErrorMessage
          title="Chart Error"
          message={error instanceof Error ? error.message : "An unexpected error occurred while rendering charts"}
          severity="error"
          size="sm"
        />
      </div>
    );
  }
};

export default SafeChartsWrapper;
