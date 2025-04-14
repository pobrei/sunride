'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui';

// Dynamically import the Charts component with no SSR
const SafeChartsWrapper = dynamic(() => import('./SafeChartsWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading charts..." centered />
    </div>
  ),
});

interface ClientSideChartsProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

export const ClientSideCharts: React.FC<ClientSideChartsProps> = (props) => {
  return <SafeChartsWrapper {...props} />;
};
