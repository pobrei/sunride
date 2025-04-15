'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui';

// Dynamically import the SimpleMap component with no SSR
const SimpleMapComponent = dynamic(() => import('./SimpleMap'), {
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
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
}

export default function ClientMap(props: ClientMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Only render the map on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[400px] bg-muted flex items-center justify-center">
        <LoadingSpinner message="Loading map..." centered />
      </div>
    );
  }

  // Only render the map if gpxData is available
  if (!props.gpxData) {
    return (
      <div className="h-[400px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Upload a GPX file to see the map</p>
        </div>
      </div>
    );
  }

  return <SimpleMapComponent {...props} />;
}
