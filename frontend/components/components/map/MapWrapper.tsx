'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@frontend/components/ui/LoadingSpinner';
import { GPXData, ForecastPoint } from '@shared/types';

interface WeatherDataPoint {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  time: string;
}

interface MapWrapperProps {
  gpxData?: GPXData;
  forecastPoints: ForecastPoint[];
  weatherData?: WeatherDataPoint[];
  onMarkerClick?: (index: number) => void;
  selectedMarker?: number | null;
}

// Dynamically import the map component with no SSR
const DynamicMap = dynamic(() => import('./SimpleLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading map..." centered variant="spinner" size="lg" />
    </div>
  ),
});

/**
 * A wrapper component for the map that handles dynamic loading
 */
export default function MapWrapper(props: MapWrapperProps): React.ReactNode {
  return <DynamicMap {...props} />;
}
