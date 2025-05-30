'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { cn } from '@/lib/utils';

interface BaseChartProps {
  title: string;
  unitLabel?: string;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Base chart component that provides a consistent wrapper for all charts
 */
const BaseChart: React.FC<BaseChartProps> = ({ title, unitLabel, children, className }) => {
  return (
    <div className={cn('w-full h-full bg-transparent', className)}>
      <div className="mb-2 px-2">
        <h3 className="text-sm font-medium text-foreground">
          {title}
          {unitLabel && <span className="text-muted-foreground ml-1">({unitLabel})</span>}
        </h3>
      </div>
      <div className="w-full h-[calc(100%-2rem)]">{children}</div>
    </div>
  );
};

export default BaseChart;
