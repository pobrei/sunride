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
    <div className={cn('p-4 bg-transparent overflow-visible text-zinc-700', className)}>
      <Tabs defaultValue="temperature" className="w-full bg-transparent">
        <TabsList className="mb-4 flex flex-wrap bg-white overflow-x-auto snap-x scroll-smooth px-2 min-w-[300px]">
          <TabsTrigger value="temperature" className="transition-all duration-200 ease-in-out hover:shadow active:scale-[0.98]">Temperature</TabsTrigger>
          <TabsTrigger value="precipitation" className="transition-all duration-200 ease-in-out hover:shadow active:scale-[0.98]">Precipitation</TabsTrigger>
          <TabsTrigger value="wind" className="transition-all duration-200 ease-in-out hover:shadow active:scale-[0.98]">Wind</TabsTrigger>
          <TabsTrigger value="humidity" className="transition-all duration-200 ease-in-out hover:shadow active:scale-[0.98]">Humidity</TabsTrigger>
          <TabsTrigger value="pressure" className="transition-all duration-200 ease-in-out hover:shadow active:scale-[0.98]">Pressure</TabsTrigger>
          <TabsTrigger value="elevation" className="transition-all duration-200 ease-in-out hover:shadow active:scale-[0.98]">Elevation</TabsTrigger>
          <TabsTrigger value="uv-index" className="transition-all duration-200 ease-in-out hover:shadow active:scale-[0.98]">UV Index</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature" className="mt-0 bg-transparent overflow-visible">
          <TemperatureChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0}
          />
        </TabsContent>

        <TabsContent value="precipitation" className="mt-0 bg-transparent overflow-visible">
          <PrecipitationChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.1}
          />
        </TabsContent>

        <TabsContent value="wind" className="mt-0 bg-transparent overflow-visible">
          <WindChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.2}
          />
        </TabsContent>

        <TabsContent value="humidity" className="mt-0 bg-transparent overflow-visible">
          <HumidityChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.3}
          />
        </TabsContent>

        <TabsContent value="pressure" className="mt-0 bg-transparent overflow-visible">
          <PressureChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.4}
          />
        </TabsContent>

        <TabsContent value="elevation" className="mt-0 bg-transparent overflow-visible">
          <ElevationChart
            gpxData={gpxData}
            forecastPoints={forecastPoints}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
            delay={0.5}
          />
        </TabsContent>

        <TabsContent value="uv-index" className="mt-0 bg-transparent overflow-visible">
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
