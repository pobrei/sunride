'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Brush,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';
import { formatDistance, formatDateTime, formatPrecipitation } from '@shared/utils/formatUtils';
import { cn } from '@shared/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';

interface EnhancedPrecipitationChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
  className?: string;
}

interface ChartDataPoint {
  distance: number;
  timestamp: number;
  precipitation: number | null;
  precipitationProbability: number | null;
  rain: number | null;
  index: number;
}

const EnhancedPrecipitationChart: React.FC<EnhancedPrecipitationChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  className,
}) => {
  // State for zoom functionality
  const [zoomDomain, setZoomDomain] = useState<{ start: number; end: number } | null>(null);
  const [startZoom, setStartZoom] = useState<number | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [xAxisMode, setXAxisMode] = useState<'distance' | 'time'>('distance');
  const [showProbability, setShowProbability] = useState(true);

  if (!forecastPoints.length || !weatherData.length) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Precipitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-muted-foreground text-sm">No precipitation data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData: ChartDataPoint[] = forecastPoints.map((point, index) => {
    const weather = weatherData[index];
    return {
      distance: point.distance,
      timestamp: point.timestamp,
      precipitation: weather?.precipitation ?? weather?.rain ?? null,
      precipitationProbability: weather?.precipitationProbability !== undefined
        ? weather.precipitationProbability * 100 // Convert to percentage
        : null,
      rain: weather?.rain ?? null,
      index,
    };
  });

  // Calculate min and max values for better chart display
  const precipValues = chartData
    .map(d => d.precipitation)
    .filter(Boolean) as number[];

  const maxPrecip = Math.max(...precipValues, 0.1);

  const minDistance = 0;
  const maxDistance = Math.max(...chartData.map(d => d.distance));

  const minTime = Math.min(...chartData.map(d => d.timestamp));
  const maxTime = Math.max(...chartData.map(d => d.timestamp));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;

      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md text-xs">
          <p className="font-semibold">{formatDateTime(data.timestamp)}</p>
          <p>{`Distance: ${formatDistance(data.distance)}`}</p>
          {data.precipitation !== null && data.precipitation !== undefined && (
            <p>{`Precipitation: ${formatPrecipitation(data.precipitation)}`}</p>
          )}
          {data.precipitationProbability !== null && data.precipitationProbability !== undefined && (
            <p>{`Probability: ${Math.round(data.precipitationProbability)}%`}</p>
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
    onChartClick(clickedPoint.index);
  };

  // Handle zoom functionality
  const handleMouseDown = (e: any) => {
    if (!e || !e.activeLabel) return;
    setStartZoom(parseFloat(e.activeLabel));
    setIsZooming(true);
  };

  const handleMouseMove = (e: any) => {
    if (!isZooming || !startZoom || !e || !e.activeLabel) return;

    const currentValue = parseFloat(e.activeLabel);
    setZoomDomain({
      start: Math.min(startZoom, currentValue),
      end: Math.max(startZoom, currentValue),
    });
  };

  const handleMouseUp = () => {
    if (!isZooming || !zoomDomain) {
      setIsZooming(false);
      setStartZoom(null);
      return;
    }

    // Only apply zoom if the area is significant
    const range = xAxisMode === 'distance' ? maxDistance - minDistance : maxTime - minTime;
    if (Math.abs(zoomDomain.end - zoomDomain.start) > range * 0.05) {
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

  // Toggle x-axis mode
  const toggleXAxisMode = () => {
    setXAxisMode(prev => prev === 'distance' ? 'time' : 'distance');
    setZoomDomain(null); // Reset zoom when changing axis mode
  };

  // Toggle probability display
  const toggleProbability = () => {
    setShowProbability(prev => !prev);
  };

  // Format x-axis ticks
  const formatXAxisTick = (value: number) => {
    if (xAxisMode === 'distance') {
      return `${Math.round(value)}km`;
    } else {
      // Format timestamp to hours:minutes
      const date = new Date(value * 1000);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Precipitation</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleProbability}
            className="text-xs h-8"
          >
            {showProbability ? 'Hide Probability' : 'Show Probability'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleXAxisMode}
            className="text-xs h-8"
          >
            {xAxisMode === 'distance' ? 'Show Time' : 'Show Distance'}
          </Button>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              onClick={handleChartClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis
                dataKey={xAxisMode === 'distance' ? 'distance' : 'timestamp'}
                type="number"
                domain={
                  zoomDomain
                    ? [zoomDomain.start, zoomDomain.end]
                    : xAxisMode === 'distance'
                      ? [minDistance, maxDistance]
                      : [minTime, maxTime]
                }
                tickFormatter={formatXAxisTick}
                stroke="hsl(var(--foreground))"
              />
              <YAxis
                yAxisId="precipitation"
                domain={[0, maxPrecip * 1.2]}
                tickFormatter={(value) => `${value} mm`}
                stroke="hsl(var(--foreground))"
              />
              {showProbability && (
                <YAxis
                  yAxisId="probability"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  stroke="hsl(var(--secondary))"
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Precipitation amount */}
              <Bar
                yAxisId="precipitation"
                dataKey="precipitation"
                name="Precipitation"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
              />

              {/* Precipitation probability */}
              {showProbability && (
                <Line
                  yAxisId="probability"
                  type="monotone"
                  dataKey="precipitationProbability"
                  name="Probability"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 2,
                    fill: 'hsl(var(--secondary))'
                  }}
                />
              )}

              {/* Reference line for selected marker */}
              {selectedMarker !== null && (
                <ReferenceLine
                  yAxisId="precipitation"
                  x={xAxisMode === 'distance'
                    ? forecastPoints[selectedMarker].distance
                    : forecastPoints[selectedMarker].timestamp
                  }
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              )}

              {/* Zoom selection area */}
              {isZooming && startZoom !== null && zoomDomain && (
                <ReferenceArea
                  yAxisId="precipitation"
                  x1={zoomDomain.start}
                  x2={zoomDomain.end}
                  strokeOpacity={0.3}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
              )}

              {/* Brush for additional navigation */}
              <Brush
                dataKey={xAxisMode === 'distance' ? 'distance' : 'timestamp'}
                height={30}
                stroke="hsl(var(--primary))"
                tickFormatter={formatXAxisTick}
                startIndex={0}
                endIndex={chartData.length - 1}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPrecipitationChart;
