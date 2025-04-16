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
import ChartCard from './ChartCard';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';
import '@frontend/styles/chart-styles.css';

interface PrecipitationChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

const PrecipitationChart: React.FC<PrecipitationChartProps> = ({
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
      precipitation: number;
      probability: number;
      index: number;
      isSelected: boolean;
      timestamp: number;
    }>
  >([]);
  const [maxPrecip, setMaxPrecip] = useState<number>(10); // Default max precipitation

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

    // Filter out null weather data and extract precipitation values
    const validWeatherData = weatherData.filter(w => w !== null) as WeatherData[];
    const precipValues = validWeatherData.map(w => w.precipitation || 0);

    // Calculate max precipitation with a buffer for better visualization
    const maxValue = Math.max(...precipValues);
    setMaxPrecip(maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10); // Add 20% buffer or default to 10mm

    const data = forecastPoints.map((point, index) => {
      const weather = weatherData[index];
      return {
        name: formatTime(point.timestamp),
        distance: formatDistance(point.distance * 1000), // Convert km to meters before formatting
        precipitation: weather?.precipitation ?? 0,
        probability: (weather?.precipitationProbability ?? 0) * 100, // Convert to percentage (0-100)
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
    payload?: Array<{
      payload: { distance: string; precipitation: number; precipProbability: number };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          <p className="chart-tooltip-label">Distance: {data.distance}</p>
          <p className="precipitation-value">Precipitation: {data.precipitation.toFixed(1)} mm</p>
          <p className="probability-value">Probability: {data.probability.toFixed(0)}%</p>
        </div>
      );
    }
    return null;
  };

  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  // Get precipitation colors from theme
  const precipColor = theme.precipitation; // Steel blue for precipitation
  const probColor = theme.probability; // Purple for probability

  return (
    <ChartCard title="Precipitation" unitLabel="mm / %">
      <div className="h-[350px] w-full px-4 pb-6 chart-wrapper-visible">
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
              yAxisId="left"
              stroke={precipColor}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              dx={-10}
              domain={[0, maxPrecip]}
              label={{
                value: 'mm',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: precipColor },
                offset: 0,
                dx: -15,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={probColor}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              domain={[0, 100]}
              label={{
                value: '%',
                angle: -90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: probColor },
                offset: 0,
                dx: 15,
              }}
              tickFormatter={value => `${value}`}
            />

            {/* Reference lines for precipitation levels */}
            <ReferenceLine
              yAxisId="left"
              y={5}
              stroke="#90cdf4"
              strokeDasharray="3 3"
              label={{
                value: 'Moderate',
                position: 'insideBottomRight',
                fill: theme.text,
                fontSize: 10,
              }}
            />

            <ReferenceLine
              yAxisId="right"
              y={50}
              stroke="#9f7aea"
              strokeDasharray="3 3"
              label={{
                value: '50%',
                position: 'insideTopRight',
                fill: theme.text,
                fontSize: 10,
              }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
            />
            <Bar
              key="precipitation-bar"
              yAxisId="left"
              dataKey="precipitation"
              name="Precipitation (mm)"
              fill={precipColor}
              radius={[4, 4, 0, 0]}
              barSize={20}
              opacity={0.8}
            />
            <Line
              key="probability-line"
              yAxisId="right"
              type="monotone"
              dataKey="probability"
              name="Probability (%)"
              stroke={probColor}
              strokeWidth={2}
              connectNulls
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default PrecipitationChart;
