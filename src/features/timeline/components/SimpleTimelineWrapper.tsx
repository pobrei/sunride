'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui';

interface SimpleTimelineWrapperProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
}

export default function SimpleTimelineWrapper(props: SimpleTimelineWrapperProps) {
  return (
    <div className="h-[150px] bg-muted flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner message="Timeline component is disabled" centered />
        <p className="mt-2 text-sm text-muted-foreground">
          Timeline functionality is temporarily disabled to fix rendering issues
        </p>
      </div>
    </div>
  );
}
