'use client';

import React, { useState, useEffect } from 'react';
import { GPXData } from '@/types';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import Charts from '@/components/Charts';
import { useSafeData } from '@/components/SafeDataProvider';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafeChartsWrapperProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const SafeChartsWrapper: React.FC<SafeChartsWrapperProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick
}) => {
  const [hasError, setHasError] = useState(false);
  const { validateGPXData, validateForecastPoints, validateWeatherData } = useSafeData();

  // Validate the data
  const validGpxData = validateGPXData(gpxData);
  const validForecastPoints = validateForecastPoints(forecastPoints);
  const validWeatherData = validateWeatherData(weatherData);

  // Check if the data is valid
  useEffect(() => {
    const isDataValid =
      validGpxData !== null &&
      validGpxData.points.length > 0 &&
      validForecastPoints.length > 0 &&
      validWeatherData.some(item => item !== null);

    setHasError(!isDataValid);
  }, [validGpxData, validForecastPoints, validWeatherData]);

  // If the data is invalid, show a fallback UI
  if (hasError) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chart Data Error</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't display the charts because the data is invalid or incomplete.
          </p>
          <div className="text-sm text-muted-foreground mb-4">
            <p>Please try the following:</p>
            <ul className="list-disc text-left pl-5 mt-2">
              <li>Upload a different GPX file</li>
              <li>Check if the GPX file contains valid elevation data</li>
              <li>Refresh the page and try again</li>
            </ul>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="w-full max-w-xs"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // If the data is valid, render the charts
  return (
    <Charts
      gpxData={validGpxData}
      forecastPoints={validForecastPoints}
      weatherData={validWeatherData}
      selectedMarker={selectedMarker}
      onChartClick={onChartClick}
    />
  );
};

export default SafeChartsWrapper;
