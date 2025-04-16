'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from 'recharts';
import ChartCard from './ChartCard';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';

interface TemperatureChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({
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
      temperature: number;
      feelsLike: number;
      index: number;
      isSelected: boolean;
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
        distance: formatDistance(point.distance),
        temperature: weather?.temperature || 0,
        feelsLike: weather?.feelsLike || 0,
        index: index,
        isSelected: index === selectedMarker,
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

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  return (
    <ChartCard title="Temperature" unitLabel="°C">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            onClick={handleClick}
          >
            <defs>
              <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke={theme.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              dy={10}
            />
            <YAxis
              stroke={theme.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.card,
                borderColor: theme.grid,
                color: theme.text,
                borderRadius: '8px',
                boxShadow: `0 4px 12px ${theme.shadow}`,
              }}
              labelStyle={{ color: theme.text }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
            />
            <Area
              key="temperature-area"
              type="monotone"
              dataKey="temperature"
              stroke={theme.primary}
              fillOpacity={1}
              fill="url(#temperatureGradient)"
              activeDot={{
                r: 8,
                stroke: theme.card,
                strokeWidth: 2,
                fill: theme.primary,
              }}
              dot={(props: { cx: number; cy: number; payload: { isSelected: boolean } }) => {
                const { cx, cy, payload } = props;
                return payload.isSelected ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={theme.primary}
                    stroke={theme.card}
                    strokeWidth={2}
                  />
                ) : (
                  <circle cx={cx} cy={cy} r={4} fill={theme.primary} opacity={0.8} />
                );
              }}
            />
            <Line
              key="feelsLike-line"
              type="monotone"
              dataKey="feelsLike"
              stroke="#8884d8"
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default TemperatureChart;
