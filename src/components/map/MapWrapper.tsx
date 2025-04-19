'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GPXData, ForecastPoint } from '@/types';
import { responsive } from '@/styles/tailwind-utils';
import { cn } from '@/lib/utils';
import { SimpleLoader } from '@/components/ui/SimpleLoader';

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
    <div
      className={cn(
        responsive.mapContainer,
        'bg-muted flex items-center justify-center max-w-7xl mx-auto'
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <SimpleLoader />
        <p className="text-sm text-muted-foreground font-medium mt-2">Loading map...</p>
      </div>
    </div>
  ),
});

/**
 * A wrapper component for the map that handles dynamic loading
 */
export default function MapWrapper(props: MapWrapperProps): JSX.Element {
  return <DynamicMap {...props} />;
}
