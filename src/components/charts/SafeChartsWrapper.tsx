'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { Charts } from './Charts';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { cn } from '@/lib/utils';

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
      <div className="w-full max-w-full flex items-center justify-center p-4 bg-white rounded-lg">
        <div className="text-center">
          <p className="text-base font-medium mb-2">Chart Data Error</p>
          <p className="text-sm text-zinc-500 mb-4">
            We couldn't display the charts because the data is invalid or incomplete.
          </p>
          <div className="text-sm text-zinc-500 mb-4">
            <p>Please try the following:</p>
            <ul className="list-disc text-left pl-5 mt-2">
              <li>Upload a different GPX file</li>
              <li>Check if the GPX file contains valid elevation data</li>
              <li>Refresh the page and try again</li>
            </ul>
          </div>
          <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm">
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="w-full max-w-full">
        <Charts
          gpxData={gpxData}
          forecastPoints={forecastPoints}
          weatherData={weatherData}
          selectedMarker={selectedMarker}
          onChartClick={onChartClick}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering charts:', error);
    return (
      <div className="h-full flex items-center justify-center p-4 bg-white rounded-lg">
        <div className="text-center">
          <p className="text-base font-medium text-red-500 mb-2">Chart Error</p>
          <p className="text-sm text-zinc-500">
            {error instanceof Error ? error.message : "An unexpected error occurred while rendering charts"}
          </p>
        </div>
      </div>
    );
  }
};

export default SafeChartsWrapper;
