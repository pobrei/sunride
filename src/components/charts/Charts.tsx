'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { cn } from '@/lib/utils';
import { responsive } from '@/styles/tailwind-utils';

// Import chart components
import TemperatureChart from './TemperatureChart';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import HumidityChart from './HumidityChart';
import PressureChart from './PressureChart';
import ElevationChart from './ElevationChart';
import UVIndexChart from './UVIndexChart';

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
  onChartClick?: (index: number) => void;
  /** Additional class names */
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
    <div className={cn('bg-transparent overflow-visible text-zinc-700 w-full max-w-full', className)}>
      <Tabs defaultValue="temperature" className="w-full max-w-full bg-transparent">
        <TabsList className="mb-2 flex flex-wrap bg-white overflow-x-auto px-2 py-1 min-w-[250px] rounded-md">
          <TabsTrigger value="temperature" className="text-xs py-1 px-2">Temperature</TabsTrigger>
          <TabsTrigger value="precipitation" className="text-xs py-1 px-2">Precipitation</TabsTrigger>
          <TabsTrigger value="wind" className="text-xs py-1 px-2">Wind</TabsTrigger>
          <TabsTrigger value="humidity" className="text-xs py-1 px-2">Humidity</TabsTrigger>
          <TabsTrigger value="pressure" className="text-xs py-1 px-2">Pressure</TabsTrigger>
          <TabsTrigger value="elevation" className="text-xs py-1 px-2">Elevation</TabsTrigger>
          <TabsTrigger value="uv-index" className="text-xs py-1 px-2">UV Index</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature" className="mt-0 bg-transparent overflow-visible w-full max-w-full">
          <TemperatureChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0}
          />
        </TabsContent>

        <TabsContent value="precipitation" className="mt-0 bg-transparent overflow-visible w-full max-w-full">
          <PrecipitationChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.1}
          />
        </TabsContent>

        <TabsContent value="wind" className="mt-0 bg-transparent overflow-visible w-full max-w-full">
          <WindChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.2}
          />
        </TabsContent>

        <TabsContent value="humidity" className="mt-0 bg-transparent overflow-visible w-full max-w-full">
          <HumidityChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.3}
          />
        </TabsContent>

        <TabsContent value="pressure" className="mt-0 bg-transparent overflow-visible w-full max-w-full">
          <PressureChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.4}
          />
        </TabsContent>

        <TabsContent value="elevation" className="mt-0 bg-transparent overflow-visible w-full max-w-full">
          <ElevationChart
            gpxData={gpxData}
            forecastPoints={forecastPoints}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.5}
          />
        </TabsContent>

        <TabsContent value="uv-index" className="mt-0 bg-transparent overflow-visible w-full max-w-full">
          <UVIndexChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.6}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
