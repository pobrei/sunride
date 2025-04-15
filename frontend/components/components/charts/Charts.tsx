'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@shared/types';
// Import chart components
import TemperatureChart from './TemperatureChart';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import ElevationChart from './ElevationChart';
import HumidityChart from './HumidityChart';
import PressureChart from './PressureChart';
import UVIndexChart from './UVIndexChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@frontend/components/ui/tabs';
import { cn } from '@shared/styles/tailwind-utils';

interface ChartsProps {
  /** GPX data containing route points */
  gpxData: GPXData | null;
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Callback when a chart point is clicked */
  onChartClick: (index: number) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * A component that displays various charts for weather and route data
 */
export function Charts({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  className,
}: ChartsProps) {
  return (
    <div className={cn('p-4', className)}>
      <Tabs defaultValue="temperature" className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
          <TabsTrigger value="wind">Wind</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="pressure">Pressure</TabsTrigger>
          <TabsTrigger value="elevation">Elevation</TabsTrigger>
          <TabsTrigger value="uv-index">UV Index</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature" className="mt-0">
          <TemperatureChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="precipitation" className="mt-0">
          <PrecipitationChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="wind" className="mt-0">
          <WindChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="humidity" className="mt-0">
          <HumidityChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="pressure" className="mt-0">
          <PressureChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="elevation" className="mt-0">
          <ElevationChart
            gpxData={gpxData}
            forecastPoints={forecastPoints}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="uv-index" className="mt-0">
          <UVIndexChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
