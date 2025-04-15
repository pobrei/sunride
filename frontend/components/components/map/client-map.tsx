'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GPXData, ForecastPoint, WeatherData } from '@shared/types';
import { LoadingSpinner } from '@frontend/components/ui/loading-spinner';

// Dynamically import the SimpleMap component with no SSR
const SimpleMap = dynamic(() => import('./simple-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading map..." centered />
    </div>
  ),
});

interface ClientMapProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onMarkerClick: (index: number) => void;
}

export function ClientMap(props: ClientMapProps) {
  const { gpxData, forecastPoints, weatherData, selectedMarker, onMarkerClick } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[400px] bg-muted flex items-center justify-center">
        <LoadingSpinner message="Initializing map..." centered />
      </div>
    );
  }

  if (!gpxData) {
    return (
      <div className="h-[400px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No Route Data</p>
          <p className="text-sm text-muted-foreground">
            Upload a GPX file to see your route on the map
          </p>
        </div>
      </div>
    );
  }

  return <SimpleMap {...props} />;
}
