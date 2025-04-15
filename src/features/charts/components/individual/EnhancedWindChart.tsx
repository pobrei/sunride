'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Brush,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { formatDistance, formatDateTime, formatWind } from '@/utils/formatUtils';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedWindChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
  className?: string;
}

interface ChartDataPoint {
  distance: number;
  timestamp: number;
  windSpeed: number | null;
  windDirection: number | null;
  windGust: number | null | undefined;
  index: number;
}

// Helper function to calculate wind direction coordinates for arrows
const getWindDirectionCoordinates = (direction: number, speed: number) => {
  // Convert direction from meteorological (0° = N, 90° = E) to mathematical (0° = E, 90° = N)
  const directionRad = ((450 - direction) % 360) * (Math.PI / 180);

  // Scale factor based on wind speed (stronger wind = longer arrow)
  const scaleFactor = Math.min(Math.max(speed / 10, 0.5), 2);

  // Calculate x and y components
  const x = Math.cos(directionRad) * scaleFactor;
  const y = Math.sin(directionRad) * scaleFactor;

  return { x, y };
};

const EnhancedWindChart: React.FC<EnhancedWindChartProps> = ({
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
  const [showWindDirection, setShowWindDirection] = useState(true);

  if (!forecastPoints.length || !weatherData.length) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Wind</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-muted-foreground text-sm">No wind data available</div>
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
      windSpeed: weather ? weather.windSpeed : null,
      windDirection: weather ? weather.windDirection : null,
      windGust: weather ? weather.windGust : null,
      index,
    };
  }).filter(point => point.windSpeed !== null);

  // Prepare data for wind direction scatter plot
  const windDirectionData = chartData.map(point => {
    if (point.windSpeed === null || point.windDirection === null) return null;

    const { x, y } = getWindDirectionCoordinates(point.windDirection, point.windSpeed);

    return {
      ...point,
      directionX: x,
      directionY: y,
    };
  }).filter(Boolean);

  // Calculate min and max values for better chart display
  const windSpeeds = chartData.map(d => d.windSpeed).filter(Boolean) as number[];
  const windGusts = chartData.map(d => d.windGust).filter(Boolean) as number[];
  const allWinds = [...windSpeeds, ...windGusts];

  const minWind = Math.floor(Math.min(...allWinds) - 2);
  const maxWind = Math.ceil(Math.max(...allWinds) + 2);

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
          {data.windSpeed !== null && data.windSpeed !== undefined && (
            <p>{`Wind Speed: ${data.windSpeed.toFixed(1)} km/h`}</p>
          )}
          {data.windGust !== null && data.windGust !== undefined && (
            <p>{`Wind Gust: ${data.windGust.toFixed(1)} km/h`}</p>
          )}
          {data.windDirection !== null && data.windDirection !== undefined && data.windSpeed !== null && data.windSpeed !== undefined && (
            <p>{`Wind Direction: ${formatWind(data.windSpeed, data.windDirection)}`}</p>
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

  // Toggle wind direction display
  const toggleWindDirection = () => {
    setShowWindDirection(prev => !prev);
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
        <CardTitle className="text-lg">Wind</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleWindDirection}
            className="text-xs h-8"
          >
            {showWindDirection ? 'Hide Direction' : 'Show Direction'}
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
            <LineChart
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
                domain={[minWind, maxWind]}
                tickFormatter={(value) => `${value} km/h`}
                stroke="hsl(var(--foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="windSpeed"
                name="Wind Speed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--primary))'
                }}
              />
              <Line
                type="monotone"
                dataKey="windGust"
                name="Wind Gust"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--destructive))'
                }}
              />

              {/* Reference line for selected marker */}
              {selectedMarker !== null && (
                <ReferenceLine
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
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Wind Direction Scatter Plot */}
        {showWindDirection && (
          <div className="h-[150px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                  name="Distance"
                />
                <YAxis
                  type="number"
                  dataKey="index"
                  name="Wind Direction"
                  tick={false}
                  axisLine={false}
                  domain={['dataMin', 'dataMax']}
                />
                <ZAxis
                  type="number"
                  dataKey="windSpeed"
                  range={[50, 400]}
                  name="Wind Speed"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={<CustomTooltip />}
                />
                <Scatter
                  name="Wind Direction"
                  data={windDirectionData}
                  fill="hsl(var(--primary))"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const { directionX, directionY, windSpeed } = payload;

                    // Calculate arrow endpoint
                    const arrowLength = Math.min(Math.max(windSpeed / 5, 5), 20);
                    const endX = cx + directionX * arrowLength;
                    const endY = cy + directionY * arrowLength;

                    // Calculate arrow head points
                    const angle = Math.atan2(directionY, directionX);
                    const headLength = arrowLength / 3;
                    const headAngle = Math.PI / 6; // 30 degrees

                    const head1X = endX - headLength * Math.cos(angle - headAngle);
                    const head1Y = endY - headLength * Math.sin(angle - headAngle);
                    const head2X = endX - headLength * Math.cos(angle + headAngle);
                    const head2Y = endY - headLength * Math.sin(angle + headAngle);

                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />
                        <line
                          x1={cx}
                          y1={cy}
                          x2={endX}
                          y2={endY}
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                        />
                        <line
                          x1={endX}
                          y1={endY}
                          x2={head1X}
                          y2={head1Y}
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                        />
                        <line
                          x1={endX}
                          y1={endY}
                          x2={head2X}
                          y2={head2Y}
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                        />
                      </g>
                    );
                  }}
                />

                {/* Reference line for selected marker */}
                {selectedMarker !== null && (
                  <ReferenceLine
                    x={xAxisMode === 'distance'
                      ? forecastPoints[selectedMarker].distance
                      : forecastPoints[selectedMarker].timestamp
                    }
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedWindChart;
