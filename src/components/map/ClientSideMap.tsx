'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card, CardContent } from '@/components/ui/card';
import { Map, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import the RobustMap component directly
import RobustMap from './RobustMap';

// Fallback loading component
const MapLoading = () => (
  <div className="h-[400px] bg-muted/30 flex items-center justify-center rounded-lg border border-border">
    <LoadingSpinner
      message="Loading map components..."
      centered
      variant="spinner"
      withContainer
      size="lg"
    />
  </div>
);

interface ClientSideMapProps {
  /** GPX data containing route points */
  gpxData: GPXData | null;
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Callback when a marker is clicked */
  onMarkerClick: (index: number) => void;
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Optional className for styling */
  className?: string;
  /** Optional height for the map */
  height?: string;
  /** Whether to show a placeholder when no data is available */
  showPlaceholder?: boolean;
}

export const ClientSideMap: React.FC<ClientSideMapProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker,
  className,
  height = "h-[400px]",
  showPlaceholder = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulate map initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle errors
  useEffect(() => {
    const handleMapError = (e: ErrorEvent) => {
      console.error('Map error:', e);
      setHasError(true);
      setErrorMessage('Failed to initialize map: ' + (e.message || 'Unknown error'));
    };

    window.addEventListener('error', handleMapError);

    return () => {
      window.removeEventListener('error', handleMapError);
    };
  }, []);

  // If there's no GPX data, show a placeholder
  if (!gpxData && showPlaceholder) {
    return (
      <Card className={cn(height, 'overflow-hidden', className)}>
        <CardContent className="p-0 h-full">
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Route Data</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload a GPX file to visualize your route on the map with weather data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there's an error, show an error message
  if (hasError) {
    return (
      <div className={cn(height, 'overflow-hidden rounded-lg', className)}>
        <ErrorMessage
          title="Map Error"
          message={errorMessage || 'Failed to load the map component'}
          severity="error"
          withContainer
          className="h-full"
          helpLink="https://openlayers.org/"
          helpLinkText="OpenLayers Documentation"
        />
      </div>
    );
  }

  // If everything is fine, render the map
  return (
    <div className={cn(height, 'relative rounded-lg overflow-hidden', className)}>
      <RobustMap
        gpxData={gpxData}
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        onMarkerClick={onMarkerClick}
        selectedMarker={selectedMarker}
        height={height}
        className={className}
        showPlaceholder={showPlaceholder}
      />


    </div>
  );
};
