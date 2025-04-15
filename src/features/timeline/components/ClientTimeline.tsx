'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui';

// Dynamically import the SimpleTimeline component with no SSR
const SimpleTimelineComponent = dynamic(() => import('./SimpleTimeline'), {
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

export default function ClientTimeline(props: ClientTimelineProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Only render the timeline on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[150px] bg-muted flex items-center justify-center">
        <LoadingSpinner message="Loading timeline..." centered />
      </div>
    );
  }

  // Only render the timeline if forecastPoints and weatherData are available
  if (
    !props.forecastPoints ||
    !props.weatherData ||
    props.forecastPoints.length === 0 ||
    props.weatherData.length === 0
  ) {
    return (
      <div className="h-[150px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No forecast data available</p>
        </div>
      </div>
    );
  }

  return <SimpleTimelineComponent {...props} />;
}
