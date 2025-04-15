'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { animation, effects } from '@/styles/tailwind-utils';

// Dynamically import the SimpleMap component with no SSR
const SimpleMap = dynamic(() => import('./SimpleLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading map..." centered />
    </div>
  ),
});

interface ClientSideMapProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
  height?: string;
  className?: string;
  showPlaceholder?: boolean;
}

export function ClientSideMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker,
  height = 'h-[400px]',
  className,
  showPlaceholder = false,
}: ClientSideMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={cn('bg-muted flex items-center justify-center', height, className)}>
        <LoadingSpinner message="Initializing map..." centered />
      </div>
    );
  }

  if (!gpxData && showPlaceholder) {
    return (
      <div className={cn('bg-muted flex items-center justify-center', height, className, animation.fadeIn)}>
        <div className="text-center">
          <p className={cn(effects.glassmorphism, "p-4 rounded-lg")}>
            Upload a GPX file to see your route on the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(height, className, animation.fadeIn)}>
      <SimpleMap 
        gpxData={gpxData}
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        onMarkerClick={onMarkerClick}
        selectedMarker={selectedMarker}
      />
    </div>
  );
}
