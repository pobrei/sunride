'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@shared/types';
import { LoadingSpinner } from '@frontend/components/ui';

interface SimpleChartsWrapperProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

export default function SimpleChartsWrapper(props: SimpleChartsWrapperProps) {
  return (
    <div className="h-[300px] bg-muted flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner message="Charts component is disabled" centered />
        <p className="mt-2 text-sm text-muted-foreground">
          Charts functionality is temporarily disabled to fix rendering issues
        </p>
      </div>
    </div>
  );
}
