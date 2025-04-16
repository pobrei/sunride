'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { ClientSideCharts } from './ClientSideCharts';

interface EnhancedClientChartsProps {
  /** GPX data containing route points */
  gpxData: GPXData | null;
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Callback when a chart point is clicked */
  onChartClick?: (index: number) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Enhanced client charts component with additional features
 */
const EnhancedClientCharts: React.FC<EnhancedClientChartsProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick = () => {},
  className,
}) => {
  return (
    <div className="space-y-8">
      <ClientSideCharts
        gpxData={gpxData}
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
        className={className}
      />
    </div>
  );
};

export default EnhancedClientCharts;
