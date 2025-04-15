'use client';

import React from 'react';
import { GPXData, ForecastPoint } from '@shared/types';
import { formatTime, formatDistance } from '@shared/utils/formatters';
import { Card, CardContent } from '@frontend/components/ui/card';
import { LoadingSpinner } from '@frontend/components/ui/LoadingSpinner';

interface ElevationChartProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

const ElevationChart: React.FC<ElevationChartProps> = ({
  gpxData,
  forecastPoints,
  selectedMarker,
  onChartClick,
}) => {
  // This is a placeholder component that would normally use a charting library

  if (!gpxData) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-lg font-medium mb-4">Elevation Chart</div>
          <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-muted-foreground text-sm">No elevation data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-lg font-medium mb-4">Elevation Chart</div>
        <div className="relative h-[200px] w-full bg-muted/20 rounded-md overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner
              message="Elevation chart visualization coming soon"
              variant="pulse"
              size="md"
            />
          </div>

          {/* Display some basic data */}
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 p-2 rounded-md text-xs">
            <div className="font-medium mb-1">Elevation Data:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between">
                <span>Min Elevation:</span>
                <span className="font-medium">{Math.round(gpxData.minElevation)} m</span>
              </div>
              <div className="flex justify-between">
                <span>Max Elevation:</span>
                <span className="font-medium">{Math.round(gpxData.maxElevation)} m</span>
              </div>
              <div className="flex justify-between">
                <span>Elevation Gain:</span>
                <span className="font-medium">{Math.round(gpxData.elevationGain)} m</span>
              </div>
              <div className="flex justify-between">
                <span>Elevation Loss:</span>
                <span className="font-medium">{Math.round(gpxData.elevationLoss)} m</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElevationChart;
