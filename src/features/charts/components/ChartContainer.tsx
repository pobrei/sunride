'use client';

import React from 'react';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import {
  TemperatureChart,
  PrecipitationChart,
  WindChart,
  HumidityChart,
  PressureChart,
  ElevationChart,
  UVIndexChart
} from './individual';

interface ChartContainerProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  if (!forecastPoints.length || !weatherData.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      <TemperatureChart
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />

      <PrecipitationChart
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />

      <WindChart
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />

      <HumidityChart
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />

      <PressureChart
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />

      <UVIndexChart
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />

      <ElevationChart
        gpxData={gpxData}
        forecastPoints={forecastPoints}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />
    </div>
  );
};

export default ChartContainer;
