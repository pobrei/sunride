'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@shared/types';
import { Charts } from './Charts';
import { ErrorMessage } from '@frontend/components/ui/ErrorMessage';
import { LoadingSpinner } from '@frontend/components/ui/LoadingSpinner';

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
    gpxData &&
    forecastPoints &&
    weatherData &&
    forecastPoints.length > 0 &&
    weatherData.length > 0 &&
    forecastPoints.length === weatherData.length;

  if (!hasValidData) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorMessage
          title="Chart Error"
          message="Invalid or missing chart data"
          severity="warning"
          size="sm"
        />
      </div>
    );
  }

  return (
    <Charts
      gpxData={gpxData}
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      selectedMarker={selectedMarker}
      onChartClick={onChartClick}
    />
  );
};

export default SafeChartsWrapper;
