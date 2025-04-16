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
  Legend
} from 'recharts';
import ChartCard from './ChartCard';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';

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
  const [chartData, setChartData] = useState<any[]>([]);
  
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
        humidity: weather?.humidity || 0,
        index: index,
        isSelected: index === selectedMarker,
      };
    });
    
    setChartData(data);
  }, [forecastPoints, weatherData, selectedMarker]);
  
  // Handle chart click
  const handleClick = (data: any) => {
    if (onChartClick && data?.activePayload?.[0]?.payload) {
      onChartClick(data.activePayload[0].payload.index);
    }
  };
  
  // Get theme colors
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;
  
  return (
    <ChartCard title="Humidity" unitLabel="%">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            onClick={handleClick}
          >
            <defs>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              stroke={theme.grid} 
              strokeDasharray="3 3" 
              vertical={false} 
            />
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
              domain={[0, 100]}
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
              type="monotone"
              dataKey="humidity"
              name="Humidity (%)"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#humidityGradient)"
              activeDot={{ 
                r: 8, 
                stroke: theme.card, 
                strokeWidth: 2,
                fill: "#3b82f6" 
              }}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return payload.isSelected ? (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={6} 
                    fill="#3b82f6" 
                    stroke={theme.card}
                    strokeWidth={2}
                  />
                ) : (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={4} 
                    fill="#3b82f6" 
                    opacity={0.8}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default HumidityChart;
