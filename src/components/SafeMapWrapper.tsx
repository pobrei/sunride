'use client';

import React, { useState, useEffect } from 'react';
import { GPXData } from '@/utils/gpxParser';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import SimpleMap from '@/components/SimpleMap';
import { useSafeData } from '@/components/SafeDataProvider';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafeMapWrapperProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
}

const SafeMapWrapper: React.FC<SafeMapWrapperProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker
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
      <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth">
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="p-6 rounded-xl bg-card shadow-lg text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Map Data Error</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't display the map because the route data is invalid or incomplete.
            </p>
            <div className="text-sm text-muted-foreground mb-4">
              <p>Please try the following:</p>
              <ul className="list-disc text-left pl-5 mt-2">
                <li>Upload a different GPX file</li>
                <li>Check if the GPX file contains valid coordinates</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Always use the SimpleMap component to avoid Leaflet-related errors
  return (
    <SimpleMap
      gpxData={validGpxData}
      forecastPoints={validForecastPoints}
      weatherData={validWeatherData}
      onMarkerClick={onMarkerClick}
      selectedMarker={selectedMarker}
    />
  );
};

export default SafeMapWrapper;
