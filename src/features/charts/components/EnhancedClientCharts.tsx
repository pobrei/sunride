'use client';

import React from 'react';
import { ClientSideCharts } from '@/components/charts';
import { GPXData, ForecastPoint, WeatherData } from '@/types';

interface EnhancedClientChartsProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
  height?: string;
}

const EnhancedClientCharts: React.FC<EnhancedClientChartsProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  height,
}) => {
  // Simply use the regular ClientSideCharts component
  return (
    <ClientSideCharts
      gpxData={gpxData}
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      selectedMarker={selectedMarker}
      onChartClick={onChartClick}
      height={height}
    />
  );
};

export default EnhancedClientCharts;
