'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { ForecastPoint, WeatherData } from '@shared/types';
import { LoadingSpinner } from '@frontend/components/ui';

// Dynamically import the Timeline component with no SSR
const SafeTimelineWrapper = dynamic(() => import('./SafeTimelineWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-[150px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading timeline..." centered />
    </div>
  ),
});

interface ClientSideTimelineProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
}

export const ClientSideTimeline: React.FC<ClientSideTimelineProps> = props => {
  return <SafeTimelineWrapper {...props} />;
};
