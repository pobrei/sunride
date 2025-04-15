'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// Import from features
import { ForecastPoint, WeatherData } from '@/features/weather/types';

// Import from components
import Timeline from './Timeline';
import { useSafeData } from '@/features/data-validation/context';
import { Button } from '@/components/ui/button';

interface SafeTimelineWrapperProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
}

const SafeTimelineWrapper: React.FC<SafeTimelineWrapperProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onTimelineClick,
}) => {
  const [hasError, setHasError] = useState(false);
  const { validateForecastPoints, validateWeatherData } = useSafeData();

  // Validate the data
  const validForecastPoints = validateForecastPoints(forecastPoints);
  const validWeatherData = validateWeatherData(weatherData);

  // Check if the data is valid
  useEffect(() => {
    const isDataValid =
      validForecastPoints.length > 0 && validWeatherData.some(item => item !== null);

    setHasError(!isDataValid);
  }, [validForecastPoints, validWeatherData]);

  // If the data is invalid, show a fallback UI
  if (hasError) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Timeline Data Error</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't display the timeline because the data is invalid or incomplete.
          </p>
          <div className="text-sm text-muted-foreground mb-4">
            <p>Please try the following:</p>
            <ul className="list-disc text-left pl-5 mt-2">
              <li>Upload a different GPX file</li>
              <li>Check if the weather data was fetched correctly</li>
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

  // If the data is valid, render the timeline
  return (
    <Timeline
      forecastPoints={validForecastPoints}
      weatherData={validWeatherData}
      selectedMarker={selectedMarker}
      onTimelineClick={onTimelineClick}
    />
  );
};

export default SafeTimelineWrapper;
