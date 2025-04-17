'use client';

import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import BaseChart from './BaseChart';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance, formatWindSpeed } from '@/utils/formatters';
import { chartTheme } from './chart-theme';
import '@/styles/chart-styles.css';

interface WindChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const WindChart: React.FC<WindChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartData, setChartData] = useState<
    Array<{
      name: string;
      distance: string;
      windSpeed: number;
      windGust: number;
      windDirection: number;
      index: number;
      isSelected: boolean;
      timestamp: number;
    }>
  >([]);

  // Check for dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(darkModeQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      darkModeQuery.addEventListener('change', handleChange);
      return () => darkModeQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Prepare chart data
  useEffect(() => {
    if (forecastPoints.length === 0 || weatherData.length === 0) return;

    const data = forecastPoints.map((point, index) => {
      const weather = weatherData[index];
      return {
        name: formatTime(point.timestamp),
        distance: formatDistance(point.distance * 1000), // Convert km to meters before formatting
        windSpeed: weather?.windSpeed || 0,
        windGust: weather?.windGust || 0,
        windDirection: weather?.windDirection || 0,
        index: index,
        isSelected: index === selectedMarker,
        timestamp: point.timestamp,
      };
    });

    setChartData(data);
  }, [forecastPoints, weatherData, selectedMarker]);

  // Handle chart click
  const handleClick = (data: { activePayload?: Array<{ payload: { index: number } }> }) => {
    if (onChartClick && data?.activePayload?.[0]?.payload) {
      onChartClick(data.activePayload[0].payload.index);
    }
  };

  // Custom tooltip formatter
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { distance: string; windSpeed: number; windDirection: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Get wind direction as compass point
      const getWindDirection = (degrees: number) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
      };

      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          <p className="chart-tooltip-label">Distance: {data.distance}</p>
          <p className="wind-speed-value">Wind Speed: {formatWindSpeed(data.windSpeed)}</p>
          {data.windGust > 0 && (
            <p className="wind-gust-value">Wind Gust: {formatWindSpeed(data.windGust)}</p>
          )}
          <p className="wind-direction-value">
            Direction: {getWindDirection(data.windDirection)} ({data.windDirection}°)
          </p>
        </div>
      );
    }
    return null;
  };

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  // Define wind speed categories
  const lightBreeze = 4.2; // m/s (15 km/h)
  const moderateWind = 8.3; // m/s (30 km/h)

  return (
    <BaseChart title="Wind" unitLabel="m/s" forecastPoints={forecastPoints} weatherData={weatherData} selectedMarker={selectedMarker} onChartClick={onChartClick}>
      <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            onClick={handleClick}
          >
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke={theme.text}
              fontSize={12}
              tickLine={true}
              axisLine={{ stroke: theme.grid }}
              dy={15}
            />
            <YAxis
              stroke={theme.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              dx={-10}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
            />

            {/* Reference lines for wind categories */}
            <ReferenceLine
              y={lightBreeze}
              stroke={theme.grid}
              strokeDasharray="3 3"
              label={{
                value: 'Light Breeze',
                position: 'insideBottomRight',
                fill: theme.text,
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={moderateWind}
              stroke={theme.grid}
              strokeDasharray="3 3"
              label={{
                value: 'Moderate Wind',
                position: 'insideBottomRight',
                fill: theme.text,
                fontSize: 10,
              }}
            />

            <Bar
              key="windSpeed-bar"
              dataKey="windSpeed"
              name="Wind Speed (m/s)"
              fill={theme.wind}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              key="windGust-line"
              type="monotone"
              dataKey="windGust"
              name="Wind Gust (m/s)"
              stroke="#ff7300"
              strokeDasharray="3 3"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
    </BaseChart>
  );
};

export default WindChart;
