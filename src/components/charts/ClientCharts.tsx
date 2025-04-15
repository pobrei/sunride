'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui';

// Dynamically import the SimpleCharts component with no SSR
const SimpleCharts = dynamic(() => import('./SimpleCharts'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading charts..." centered />
    </div>
  ),
});

interface ClientChartsProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

export default function ClientCharts(props: ClientChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Only render the charts on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[300px] bg-muted flex items-center justify-center">
        <LoadingSpinner message="Loading charts..." centered />
      </div>
    );
  }

  // Only render the charts if forecastPoints and weatherData are available
  if (
    !props.forecastPoints ||
    !props.weatherData ||
    props.forecastPoints.length === 0 ||
    props.weatherData.length === 0
  ) {
    return (
      <div className="h-[300px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No forecast data available</p>
        </div>
      </div>
    );
  }

  return <SimpleCharts {...props} />;
}
