'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance, formatPrecipitation } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PrecipitationChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const PrecipitationChart: React.FC<PrecipitationChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  // This is a placeholder component that would normally use a charting library

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Precipitation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[200px] w-full bg-muted/20 rounded-md overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner
              message="Precipitation chart visualization coming soon"
              variant="pulse"
              size="md"
            />
          </div>

          {/* Display some basic data */}
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 p-2 rounded-md text-xs">
            <div className="font-medium mb-1">Precipitation Data:</div>
            <div className="grid grid-cols-2 gap-2">
              {weatherData.slice(0, 4).map(
                (weather, index) =>
                  weather && (
                    <div key={index} className="flex justify-between">
                      <span>{formatTime(forecastPoints[index].timestamp)}</span>
                      <span className="font-medium">
                        {formatPrecipitation(weather.precipitation)}
                      </span>
                    </div>
                  )
              )}
              {weatherData.length > 4 && (
                <div className="col-span-2 text-center text-muted-foreground">
                  + {weatherData.length - 4} more points
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrecipitationChart;
