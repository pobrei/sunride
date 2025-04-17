'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ReferenceLine,
} from 'recharts';
import ChartCard from './ChartCard';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance, formatTemperature } from '@/utils/formatters';
import { chartTheme } from './chart-theme';
import { responsive } from '@/styles/tailwind-utils';
import { cn } from '@/lib/utils';
import '@/styles/chart-styles.css';

interface TemperatureChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
  /** Animation delay in seconds */
  delay?: number;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onChartClick,
  delay = 0,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartData, setChartData] = useState<
    Array<{
      name: string;
      distance: string;
      temperature: number | null;
      feelsLike: number | null;
      index: number;
      isSelected: boolean;
      timestamp: number;
    }>
  >([]);
  const [minTemp, setMinTemp] = useState<number>(0);
  const [maxTemp, setMaxTemp] = useState<number>(0);

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

    // Filter out null weather data and extract temperatures
    const validWeatherData = weatherData.filter(w => w !== null) as WeatherData[];
    const temperatures = validWeatherData.map(w => w.temperature);
    const feelsLikeTemps = validWeatherData.map(w => w.feelsLike);

    // Calculate min and max temperatures including feels like
    const allTemps = [...temperatures, ...feelsLikeTemps];
    const min = Math.min(...allTemps);
    const max = Math.max(...allTemps);

    // Add a small buffer to min/max for better visualization
    setMinTemp(Math.floor(min - 1));
    setMaxTemp(Math.ceil(max + 1));

    const data = forecastPoints.map((point, index) => {
      const weather = weatherData[index];
      return {
        name: formatTime(point.timestamp),
        distance: formatDistance(point.distance * 1000), // Convert km to meters before formatting
        temperature: weather?.temperature ?? null,
        feelsLike: weather?.feelsLike ?? null,
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
    payload?: Array<{ payload: { distance: string; temperature: number; feelsLike: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          <p className="chart-tooltip-label">Distance: {data.distance}</p>
          {data.temperature !== null && (
            <p className="temperature-value">Temperature: {formatTemperature(data.temperature)}</p>
          )}
          {data.feelsLike !== null && (
            <p className="feels-like-value">Feels like: {formatTemperature(data.feelsLike)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  return (
    <ChartCard title="Temperature & Feels Like" unitLabel="°C">
      <div className={cn(responsive.chartContainer, "chart-wrapper-visible")}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            onClick={handleClick}
          >
            <defs>
              <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.temperature} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.temperature} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="feelsLikeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.feelsLike} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.feelsLike} stopOpacity={0} />
              </linearGradient>
            </defs>
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
              domain={[minTemp, maxTemp]}
              tickFormatter={value => `${value}°`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
            />

            {/* Reference line for freezing temperature */}
            <ReferenceLine
              y={0}
              stroke="#90cdf4"
              strokeDasharray="3 3"
              label={{
                value: 'Freezing',
                position: 'insideBottomRight',
                fill: theme.text,
                fontSize: 10,
              }}
            />

            {/* Temperature Area */}
            <Area
              name="Temperature"
              type="monotone"
              dataKey="temperature"
              stroke={theme.temperature}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#temperatureGradient)"
              connectNulls
              activeDot={{
                r: 8,
                stroke: theme.card,
                strokeWidth: 2,
                fill: theme.temperature,
              }}
              dot={false}
            />

            {/* Feels Like Line */}
            <Line
              name="Feels Like"
              type="monotone"
              dataKey="feelsLike"
              stroke={theme.feelsLike}
              strokeWidth={2}
              connectNulls
              dot={false}
              activeDot={{
                r: 6,
                stroke: theme.card,
                strokeWidth: 2,
                fill: theme.feelsLike,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default TemperatureChart;
