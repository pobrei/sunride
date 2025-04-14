'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui';

interface SimpleMapWrapperProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
}

export default function SimpleMapWrapper(props: SimpleMapWrapperProps) {
  return (
    <div className="h-[400px] bg-muted flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner message="Map component is disabled" centered />
        <p className="mt-2 text-sm text-muted-foreground">
          Map functionality is temporarily disabled to fix rendering issues
        </p>
      </div>
    </div>
  );
}
