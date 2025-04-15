'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { GPXData } from '@frontend/features/gpx/types';
import { ForecastPoint } from '@frontend/features/weather/types';
import { formatDistance } from '@shared/utils/formatUtils';
import { cn } from '@shared/lib/utils';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';

interface EnhancedElevationChartProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
  className?: string;
}

interface ChartDataPoint {
  distance: number;
  elevation: number;
  lat: number;
  lon: number;
  index: number;
}

const EnhancedElevationChart: React.FC<EnhancedElevationChartProps> = ({
  gpxData,
  forecastPoints,
  selectedMarker,
  onChartClick,
  className,
}) => {
  // State for zoom functionality
  const [zoomDomain, setZoomDomain] = useState<{ start: number; end: number } | null>(null);
  const [startZoom, setStartZoom] = useState<number | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  if (!gpxData || !gpxData.points || gpxData.points.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Elevation Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-muted-foreground text-sm">No elevation data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData: ChartDataPoint[] = gpxData.points.map((point, index) => ({
    distance: point.distance,
    elevation: point.elevation,
    lat: point.lat,
    lon: point.lon,
    index,
  }));

  // Find the closest point in chartData to each forecast point
  const forecastIndices = forecastPoints.map(forecastPoint => {
    return chartData.findIndex(
      point =>
        Math.abs(point.lat - forecastPoint.lat) < 0.0001 &&
        Math.abs(point.lon - forecastPoint.lon) < 0.0001
    );
  }).filter(index => index !== -1);

  // Calculate min and max values for better chart display
  const minElevation = Math.floor(gpxData.minElevation - 10);
  const maxElevation = Math.ceil(gpxData.maxElevation + 10);
  const totalDistance = gpxData.totalDistance;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;

      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md text-xs">
          <p className="font-semibold">{`Distance: ${formatDistance(data.distance)}`}</p>
          {data.elevation !== null && data.elevation !== undefined && (
            <p>{`Elevation: ${Math.round(data.elevation)}m`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Handle chart click
  const handleChartClick = (data: any) => {
    if (isZooming || !data || !data.activePayload || !data.activePayload[0]) return;

    const clickedPoint = data.activePayload[0].payload;

    // Find the closest forecast point
    const closestForecastIndex = forecastIndices.reduce((closest, current) => {
      const currentDiff = Math.abs(chartData[current].index - clickedPoint.index);
      const closestDiff = closest !== -1 ? Math.abs(chartData[closest].index - clickedPoint.index) : Infinity;
      return currentDiff < closestDiff ? current : closest;
    }, -1);

    if (closestForecastIndex !== -1) {
      onChartClick(closestForecastIndex);
    }
  };

  // Handle zoom functionality
  const handleMouseDown = (e: any) => {
    if (!e || !e.activeLabel) return;
    setStartZoom(parseFloat(e.activeLabel));
    setIsZooming(true);
  };

  const handleMouseMove = (e: any) => {
    if (!isZooming || !startZoom || !e || !e.activeLabel) return;

    const currentDistance = parseFloat(e.activeLabel);
    setZoomDomain({
      start: Math.min(startZoom, currentDistance),
      end: Math.max(startZoom, currentDistance),
    });
  };

  const handleMouseUp = () => {
    if (!isZooming || !zoomDomain) {
      setIsZooming(false);
      setStartZoom(null);
      return;
    }

    // Only apply zoom if the area is significant
    if (Math.abs(zoomDomain.end - zoomDomain.start) > totalDistance * 0.05) {
      // Zoom is now applied via the domain state
    } else {
      // Reset zoom if the area is too small
      setZoomDomain(null);
    }

    setIsZooming(false);
    setStartZoom(null);
  };

  // Reset zoom
  const resetZoom = () => {
    setZoomDomain(null);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Elevation Profile</CardTitle>
        {zoomDomain && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%" className="overflow-visible">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              onClick={handleChartClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="distance"
                type="number"
                domain={zoomDomain ? [zoomDomain.start, zoomDomain.end] : ['dataMin', 'dataMax']}
                tickFormatter={(value) => `${Math.round(value)}km`}
                stroke="hsl(var(--foreground))"
              />
              <YAxis
                domain={[minElevation, maxElevation]}
                tickFormatter={(value) => `${value}m`}
                stroke="hsl(var(--foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="elevation"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#elevationGradient)"
                activeDot={{
                  r: 6,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--primary))'
                }}
              />

              {/* Reference lines for forecast points */}
              {forecastIndices.map((index, i) => {
                const point = chartData[index];
                const isSelected = selectedMarker === i;

                return point ? (
                  <ReferenceLine
                    key={`ref-line-${i}`}
                    x={point.distance}
                    stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? "0" : "3 3"}
                  />
                ) : null;
              })}

              {/* Zoom selection area */}
              {isZooming && startZoom !== null && zoomDomain && (
                <ReferenceArea
                  x1={zoomDomain.start}
                  x2={zoomDomain.end}
                  strokeOpacity={0.3}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedElevationChart;
