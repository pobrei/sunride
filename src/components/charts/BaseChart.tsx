'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { cn } from '@/lib/utils';
import { responsive } from '@/styles/tailwind-utils';
import '@/styles/chart-styles.css';

export interface BaseChartProps {
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData?: (WeatherData | null)[];
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Callback when a chart point is clicked */
  onChartClick?: (index: number) => void;
  /** Additional class names */
  className?: string;
  /** Chart title */
  title: string;
  /** Unit label (e.g., °C, mm, etc.) */
  unitLabel?: string;
}

/**
 * Base chart component that provides common functionality for all charts
 */
const BaseChart: React.FC<BaseChartProps & { children: React.ReactNode }> = ({
  title,
  unitLabel,
  children,
  className,
}) => {
  return (
    <div className={cn("w-full max-w-full", className)}>
      <div className="flex items-center justify-between pb-2 px-2 bg-white dark:bg-zinc-800 rounded-t-lg shadow-sm">
        <h2 className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-white">{title}</h2>
        {unitLabel && (
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {unitLabel}
          </span>
        )}
      </div>
      <div className={cn(responsive.chartContainer, "bg-white dark:bg-zinc-800 rounded-b-lg shadow-sm p-2 sm:p-3 border border-zinc-100 dark:border-zinc-700")}>
        {children}
      </div>
    </div>
  );
};

export default BaseChart;
