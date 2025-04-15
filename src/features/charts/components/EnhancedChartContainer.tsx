'use client';

import React, { useState, useEffect } from 'react';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from 'lucide-react';

// Dynamically import chart components with error handling
const EnhancedElevationChart = dynamic(() => import('./individual/EnhancedElevationChart').catch(err => {
  console.error('Failed to load EnhancedElevationChart:', err);
  return () => <FallbackChart title="Elevation" />;
}), { ssr: false, loading: () => <ChartLoading title="Elevation" /> });

const EnhancedTemperatureChart = dynamic(() => import('./individual/EnhancedTemperatureChart').catch(err => {
  console.error('Failed to load EnhancedTemperatureChart:', err);
  return () => <FallbackChart title="Temperature" />;
}), { ssr: false, loading: () => <ChartLoading title="Temperature" /> });

const EnhancedWindChart = dynamic(() => import('./individual/EnhancedWindChart').catch(err => {
  console.error('Failed to load EnhancedWindChart:', err);
  return () => <FallbackChart title="Wind" />;
}), { ssr: false, loading: () => <ChartLoading title="Wind" /> });

const EnhancedPrecipitationChart = dynamic(() => import('./individual/EnhancedPrecipitationChart').catch(err => {
  console.error('Failed to load EnhancedPrecipitationChart:', err);
  return () => <FallbackChart title="Precipitation" />;
}), { ssr: false, loading: () => <ChartLoading title="Precipitation" /> });

// Add the missing chart components
const EnhancedHumidityChart = dynamic(() => import('./individual/EnhancedHumidityChart').catch(err => {
  console.error('Failed to load EnhancedHumidityChart:', err);
  return () => <FallbackChart title="Humidity" />;
}), { ssr: false, loading: () => <ChartLoading title="Humidity" /> });

const EnhancedPressureChart = dynamic(() => import('./individual/EnhancedPressureChart').catch(err => {
  console.error('Failed to load EnhancedPressureChart:', err);
  return () => <FallbackChart title="Pressure" />;
}), { ssr: false, loading: () => <ChartLoading title="Pressure" /> });

const EnhancedUVIndexChart = dynamic(() => import('./individual/EnhancedUVIndexChart').catch(err => {
  console.error('Failed to load EnhancedUVIndexChart:', err);
  return () => <FallbackChart title="UV Index" />;
}), { ssr: false, loading: () => <ChartLoading title="UV Index" /> });

// Loading component for charts
const ChartLoading = ({ title }: { title: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center">
        <LoadingSpinner message={`Loading ${title} chart...`} centered size="md" />
      </div>
    </CardContent>
  </Card>
);

// Fallback component for charts
const FallbackChart = ({ title }: { title: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center">
        <div className="text-center p-4">
          <LineChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Unable to load {title.toLowerCase()} chart</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface EnhancedChartContainerProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
  className?: string;
}

const EnhancedChartContainer: React.FC<EnhancedChartContainerProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  className,
}) => {
  const [chartError, setChartError] = useState(false);

  // Check for valid data
  useEffect(() => {
    if (!forecastPoints.length || !weatherData.length) {
      setChartError(true);
    } else {
      setChartError(false);
    }
  }, [forecastPoints, weatherData]);

  if (!forecastPoints.length || !weatherData.length) {
    return (
      <div className={cn("space-y-4 overflow-hidden", className)}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center">
              <div className="text-center p-4">
                <LineChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No chart data available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 overflow-hidden", className)}>
      <Tabs defaultValue="elevation" className="w-full">
        <TabsList className="flex flex-wrap mb-4 gap-1">
          <TabsTrigger value="elevation">Elevation</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="wind">Wind</TabsTrigger>
          <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="pressure">Pressure</TabsTrigger>
          <TabsTrigger value="uv-index">UV Index</TabsTrigger>
        </TabsList>

        <TabsContent value="elevation" className="mt-0">
          <EnhancedElevationChart
            gpxData={gpxData}
            forecastPoints={forecastPoints}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="temperature" className="mt-0">
          <EnhancedTemperatureChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="wind" className="mt-0">
          <EnhancedWindChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="precipitation" className="mt-0">
          <EnhancedPrecipitationChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="humidity" className="mt-0">
          <EnhancedHumidityChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="pressure" className="mt-0">
          <EnhancedPressureChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>

        <TabsContent value="uv-index" className="mt-0">
          <EnhancedUVIndexChart
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            selectedMarker={selectedMarker}
            onChartClick={onChartClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedChartContainer;
