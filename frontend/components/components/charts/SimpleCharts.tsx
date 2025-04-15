'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@shared/types';
import { formatTime, formatTemperature } from '@shared/utils/formatUtils';

interface SimpleChartsProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onChartClick: (index: number) => void;
}

export default function SimpleCharts(props: SimpleChartsProps) {
  const { gpxData, forecastPoints, weatherData, selectedMarker, onChartClick } = props;

  // If no forecast points, show a message
  if (!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) {
    return (
      <div className="h-[300px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No forecast data available</p>
        </div>
      </div>
    );
  }

  // Get min and max values for temperature and precipitation
  const temperatures = weatherData
    .filter(w => w && w.temperature !== undefined)
    .map(w => w!.temperature!);

  const precipitations = weatherData
    .filter(w => w && w.precipitation !== undefined)
    .map(w => w!.precipitation!);

  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const maxPrecip = Math.max(...precipitations);

  // Render a simple charts representation
  return (
    <div className="h-[300px] bg-muted p-4">
      <div className="bg-background rounded-lg p-4 h-full overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Weather Charts (Simple View)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Charts are displayed in simple mode due to Chart.js loading issues.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Temperature Chart */}
          <div className="border rounded-lg p-3">
            <h4 className="font-medium mb-2">Temperature</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Range: {formatTemperature(minTemp)} to {formatTemperature(maxTemp)}
            </p>
            <div className="h-[100px] relative border-b border-l">
              {forecastPoints.map((point, index) => {
                const weather = weatherData[index];
                if (!weather || weather.temperature === undefined) return null;

                const isSelected = selectedMarker === index;
                const tempPercentage =
                  ((weather.temperature - minTemp) / (maxTemp - minTemp)) * 100;

                // Calculate height and left position classes
                const heightClass = `chart-bar-h-${Math.round(tempPercentage / 10) * 10}`;
                const leftPosition =
                  Math.round(((index / (forecastPoints.length - 1)) * 100) / 10) * 10;
                const leftClass = `left-${leftPosition}`;

                return (
                  <div
                    key={index}
                    className={`absolute bottom-0 w-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary' : 'bg-primary/50 hover:bg-primary/70'
                    } ${heightClass} ${leftClass}`}
                    onClick={() => onChartClick(index)}
                    title={`Point ${index + 1}: ${formatTemperature(weather.temperature)}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(forecastPoints[0].timestamp)}</span>
              <span>{formatTime(forecastPoints[forecastPoints.length - 1].timestamp)}</span>
            </div>
          </div>

          {/* Precipitation Chart */}
          <div className="border rounded-lg p-3">
            <h4 className="font-medium mb-2">Precipitation</h4>
            <p className="text-xs text-muted-foreground mb-2">Max: {maxPrecip.toFixed(1)} mm</p>
            <div className="h-[100px] relative border-b border-l">
              {forecastPoints.map((point, index) => {
                const weather = weatherData[index];
                if (!weather || weather.precipitation === undefined) return null;

                const isSelected = selectedMarker === index;
                const precipPercentage =
                  maxPrecip > 0 ? (weather.precipitation / maxPrecip) * 100 : 0;

                // Calculate height and left position classes
                const heightClass = `chart-bar-h-${Math.round(precipPercentage / 10) * 10}`;
                const leftPosition =
                  Math.round(((index / (forecastPoints.length - 1)) * 100) / 10) * 10;
                const leftClass = `left-${leftPosition}`;

                return (
                  <div
                    key={index}
                    className={`absolute bottom-0 w-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-500' : 'bg-blue-500/50 hover:bg-blue-500/70'
                    } ${heightClass} ${leftClass}`}
                    onClick={() => onChartClick(index)}
                    title={`Point ${index + 1}: ${weather.precipitation.toFixed(1)} mm`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(forecastPoints[0].timestamp)}</span>
              <span>{formatTime(forecastPoints[forecastPoints.length - 1].timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Selected Point Info */}
        {selectedMarker !== null && weatherData[selectedMarker] && (
          <div className="mt-4 p-3 border rounded-lg">
            <h4 className="font-medium mb-2">Selected Point: {selectedMarker + 1}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Time: {formatTime(forecastPoints[selectedMarker].timestamp)}</div>
              <div>Temp: {formatTemperature(weatherData[selectedMarker]?.temperature)}</div>
              <div>Precip: {weatherData[selectedMarker]?.precipitation?.toFixed(1)} mm</div>
              <div>Humidity: {weatherData[selectedMarker]?.humidity?.toFixed(0)}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
