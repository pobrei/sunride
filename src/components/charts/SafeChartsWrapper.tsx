'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { Charts } from './Charts';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { cn } from '@/lib/utils';
import { typography, animation, effects } from '@/styles/tailwind-utils';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SafeChartsWrapperProps {
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
}

/**
 * A wrapper component that safely renders the Charts component
 * with error handling and loading states
 */
const SafeChartsWrapper: React.FC<SafeChartsWrapperProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  // Validate data
  const hasValidData =
    forecastPoints &&
    weatherData &&
    forecastPoints.length > 0 &&
    weatherData.length > 0 &&
    forecastPoints.length === weatherData.length;

  if (!hasValidData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className={cn("relative rounded-2xl shadow-sm bg-white max-w-7xl mx-auto")}>
          <CardContent className={cn("flex flex-col items-center justify-center text-center")}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            </motion.div>
            <motion.h3
              className={cn("text-lg font-semibold mb-4")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              Chart Data Error
            </motion.h3>
            <motion.p
              className={cn("text-base text-zinc-700 mb-4")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              We couldn't display the charts because the data is invalid or incomplete.
            </motion.p>
            <motion.div
              className={cn("text-sm text-zinc-500 mb-4")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <p>Please try the following:</p>
              <ul className="list-disc text-left pl-5 mt-2">
                <li>Upload a different GPX file</li>
                <li>Check if the GPX file contains valid elevation data</li>
                <li>Refresh the page and try again</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Button onClick={() => window.location.reload()} className="w-full max-w-xs">
                Reload Page
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  try {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className="rounded-2xl shadow-sm bg-white pb-8 overflow-visible max-w-7xl mx-auto">
          <CardContent>
            <Charts
              gpxData={gpxData}
              forecastPoints={forecastPoints}
              weatherData={weatherData}
              selectedMarker={selectedMarker}
              onChartClick={onChartClick}
            />
            {/* Spacer moved outside of chart container to avoid interference */}
            <div className="h-16 mt-8" />
          </CardContent>
        </Card>
      </motion.div>
    );
  } catch (error) {
    console.error('Error rendering charts:', error);
    return (
      <motion.div
        className={cn("h-full flex items-center justify-center")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ErrorMessage
          title="Chart Error"
          message={error instanceof Error ? error.message : "An unexpected error occurred while rendering charts"}
          severity="error"
          size="sm"
        />
      </motion.div>
    );
  }
};

export default SafeChartsWrapper;
