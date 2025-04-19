'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import BaseChart from './BaseChart';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance, formatHumidity } from '@/utils/formatters';
import { chartTheme } from './chart-theme';
import '@/styles/chart-styles.css';

interface HumidityChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const HumidityChart: React.FC<HumidityChartProps> = ({
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
      humidity: number;
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
        humidity: weather?.humidity || 0,
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
    payload?: Array<{ payload: { distance: string; humidity: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          <p className="chart-tooltip-label">Distance: {data.distance}</p>
          <p className="humidity-value">Humidity: {formatHumidity(data.humidity)}</p>
        </div>
      );
    }
    return null;
  };

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  return (
    <BaseChart title="Humidity" unitLabel="%" forecastPoints={forecastPoints} weatherData={weatherData} selectedMarker={selectedMarker} onChartClick={onChartClick}>
      <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            onClick={handleClick}
          >
            {/* No gradients in flat design */}
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
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
            />
            <Area
              key="humidity-area"
              type="monotone"
              dataKey="humidity"
              name="Humidity (%)"
              stroke={theme.humidity}
              fillOpacity={0.05}
              fill={theme.humidity}
              activeDot={{
                r: 8,
                stroke: theme.card,
                strokeWidth: 2,
                fill: theme.humidity,
              }}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
    </BaseChart>
  );
};

export default HumidityChart;
