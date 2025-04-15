'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ForecastPoint, WeatherData } from '@shared/types';
import { LoadingSpinner } from '@frontend/components/ui/loading-spinner';

// Dynamically import the SimpleTimeline component with no SSR
const SimpleTimeline = dynamic(() => import('./simple-timeline'), {
  ssr: false,
  loading: () => (
    <div className="h-[150px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading timeline..." centered />
    </div>
  ),
});

interface ClientTimelineProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
}

export function ClientTimeline(props: ClientTimelineProps) {
  const { forecastPoints, weatherData } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[150px] bg-muted flex items-center justify-center">
        <LoadingSpinner message="Initializing timeline..." centered />
      </div>
    );
  }

  if (!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) {
    return (
      <div className="h-[150px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No forecast data available</p>
        </div>
      </div>
    );
  }

  return <SimpleTimeline {...props} />;
}
