'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@shared/types';
import { Timeline } from './Timeline';
import { ErrorMessage } from '@frontend/components/ui/ErrorMessage';
import { LoadingSpinner } from '@frontend/components/ui/LoadingSpinner';

interface SafeTimelineWrapperProps {
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Callback when a timeline item is clicked */
  onTimelineClick: (index: number) => void;
  /** Reference to the timeline container for scrolling */
  timelineRef?: React.RefObject<HTMLDivElement>;
}

/**
 * A wrapper component that safely renders the Timeline component
 * with error handling and loading states
 */
const SafeTimelineWrapper: React.FC<SafeTimelineWrapperProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onTimelineClick,
  timelineRef,
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
      <div className="h-full flex items-center justify-center">
        <ErrorMessage
          title="Timeline Error"
          message="Invalid or missing timeline data"
          severity="warning"
          size="sm"
        />
      </div>
    );
  }

  return (
    <Timeline
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      selectedMarker={selectedMarker}
      onTimelineClick={onTimelineClick}
      timelineRef={timelineRef}
    />
  );
};

export default SafeTimelineWrapper;
