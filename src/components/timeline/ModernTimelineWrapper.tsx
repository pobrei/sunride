'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { ModernTimeline } from './ModernTimeline';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface ModernTimelineWrapperProps {
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Callback when a timeline item is clicked */
  onTimelineClick: (index: number) => void;
  /** Reference to the timeline container for scrolling */
  timelineRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * A wrapper component that safely renders the ModernTimeline component
 * with error handling
 */
const ModernTimelineWrapper: React.FC<ModernTimelineWrapperProps> = ({
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
    <ModernTimeline
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      selectedMarker={selectedMarker}
      onTimelineClick={onTimelineClick}
      timelineRef={timelineRef}
    />
  );
};

export default ModernTimelineWrapper;
