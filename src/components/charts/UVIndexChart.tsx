'use client';

import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import ChartCard from './ChartCard';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';
import { chartTheme } from './chart-theme';

interface UVIndexChartProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick?: (index: number) => void;
}

// Function to get UV index color based on value
const getUVColor = (value: number) => {
  if (value <= 2) return '#3ECF8E'; // Low
  if (value <= 5) return '#FFD60A'; // Moderate
  if (value <= 7) return '#FB8B24'; // High
  if (value <= 10) return '#E53E3E'; // Very High
  return '#9F2B68'; // Extreme
};

// Function to get UV risk level
const getUVRiskLevel = (value: number) => {
  if (value <= 2) return 'Low';
  if (value <= 5) return 'Moderate';
  if (value <= 7) return 'High';
  if (value <= 10) return 'Very High';
  return 'Extreme';
};

const UVIndexChart: React.FC<UVIndexChartProps> = ({
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
      const uvIndex = weather?.uvIndex || 0;
      
      return {
        name: formatTime(point.timestamp),
        distance: formatDistance(point.distance),
        uvIndex: uvIndex,
        riskLevel: getUVRiskLevel(uvIndex),
        color: getUVColor(uvIndex),
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
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#1C1F24] p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{data.distance}</p>
          <div className="flex items-center mt-2">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: data.color }}
            />
            <p>
              <span className="font-medium">UV Index: </span>
              {data.uvIndex} ({data.riskLevel})
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <ChartCard title="UV Index" unitLabel="">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            onClick={handleClick}
          >
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
              domain={[0, 12]}
              ticks={[0, 2, 5, 7, 10, 12]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: theme.text }}
            />
            
            {/* Reference lines for UV categories */}
            <ReferenceLine y={2} stroke="#3ECF8E" strokeDasharray="3 3" />
            <ReferenceLine y={5} stroke="#FFD60A" strokeDasharray="3 3" />
            <ReferenceLine y={7} stroke="#FB8B24" strokeDasharray="3 3" />
            <ReferenceLine y={10} stroke="#E53E3E" strokeDasharray="3 3" />
            
            <Bar 
              dataKey="uvIndex" 
              name="UV Index" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={entry.isSelected ? theme.card : 'none'}
                  strokeWidth={entry.isSelected ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default UVIndexChart;
