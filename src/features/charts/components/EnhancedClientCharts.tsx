'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout, loading } from '@/styles/tailwind-utils';

// Dynamically import the Charts component with no SSR
const EnhancedChartContainer = dynamic(() => import('./EnhancedChartContainer').catch(err => {
  console.error('Failed to load EnhancedChartContainer:', err);
  // Return a fallback component when the import fails
  return () => (
    <div className={cn("h-[300px]", layout.flexCenter, effects.border, effects.rounded, "bg-muted/30", animation.fadeIn)}>
      <div className="text-center p-4">
        <LineChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-1">Chart Visualization Unavailable</h3>
        <p className="text-sm text-muted-foreground">Using simplified charts instead</p>
      </div>
    </div>
  );
}), {
  ssr: false,
  loading: () => (
    <div className={cn("h-[300px]", layout.flexCenter, effects.border, effects.rounded, "bg-muted/30", animation.fadeIn)}>
      <LoadingSpinner
        message="Loading enhanced charts..."
        centered
        variant="skeleton"
        withContainer
        size="lg"
      />
    </div>
  ),
});

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
  onChartClick: (index: number) => void;
  /** Optional className for styling */
  className?: string;
  /** Optional height for the charts */
  height?: string;
  /** Whether to show a placeholder when no data is available */
  showPlaceholder?: boolean;
}

export const EnhancedClientCharts: React.FC<EnhancedClientChartsProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  className,
  height = 'h-[400px]',
  showPlaceholder = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulate charts initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // If there's no data, show a placeholder
  if (
    (!gpxData ||
      !forecastPoints ||
      forecastPoints.length === 0 ||
      !weatherData ||
      weatherData.length === 0) &&
    showPlaceholder
  ) {
    return (
      <Card className={cn(height, 'overflow-hidden', animation.fadeIn, className)}>
        <CardContent className={cn("p-0 h-full")}>
          <div className={cn(layout.flexCenter, "h-full bg-muted/20")}>
            <div className={cn(typography.center, "p-6", animation.fadeInSlideUp)}>
              <div className={cn(layout.flexCenter, "mx-auto w-12 h-12 rounded-full bg-muted/40 mb-3", animation.fadeIn)}>
                <BarChart3 className={cn("h-6 w-6", typography.muted)} />
              </div>
              <h3 className={cn(typography.h5, "mb-1")}>No Chart Data</h3>
              <p className={cn(typography.bodySm, typography.muted, "max-w-xs")}>
                Upload a GPX file to visualize weather data in charts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there's an error, show an error message
  if (hasError) {
    return (
      <div className={cn(height, effects.rounded, 'overflow-hidden', animation.fadeIn, className)}>
        <ErrorMessage
          title="Chart Error"
          message={errorMessage || 'Failed to load the chart component'}
          severity="warning"
          withContainer
          className="h-full"
          size="sm"
        />
      </div>
    );
  }

  // If everything is fine, render the charts
  return (
    <div className={cn(height, effects.rounded, 'relative overflow-hidden max-w-full', animation.fadeIn, className)}>
      <EnhancedChartContainer
        gpxData={gpxData}
        forecastPoints={forecastPoints}
        weatherData={weatherData}
        selectedMarker={selectedMarker}
        onChartClick={onChartClick}
      />
    </div>
  );
};

export default EnhancedClientCharts;
