'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';

interface BasicMapProps {
  /** GPX data containing route points */
  gpxData: GPXData | null;
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Callback when a marker is clicked */
  onMarkerClick: (index: number) => void;
  /** Currently selected marker index */
  selectedMarker: number | null;
}

/**
 * A very basic map component that displays the route and weather data
 */
export default function BasicMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker
}: BasicMapProps) {
  // Calculate total distance
  const totalDistance = gpxData ? Math.round(gpxData.totalDistance / 1000) : 0;

  return (
    <div className="h-full w-full bg-blue-50 dark:bg-blue-900 rounded-lg overflow-hidden p-4 relative">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Route Map</h3>
        {gpxData && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {gpxData.name || 'Unnamed Route'} - {totalDistance} km
          </p>
        )}
      </div>

      {/* Simple route visualization */}
      <div className="h-[200px] bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 relative overflow-hidden">
        {gpxData && gpxData.points.length > 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-[2px] bg-blue-500 relative">
              {/* Route line */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 to-green-500"></div>

              {/* Start marker */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800"></div>

              {/* End marker */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-600 rounded-full border-2 border-white dark:border-gray-800"></div>

              {/* Forecast points */}
              {forecastPoints.map((_, index) => {
                const position = Math.round((index / (forecastPoints.length - 1)) * 100 / 5) * 5;
                const isSelected = index === selectedMarker;

                return (
                  <button
                    key={index}
                    type="button"
                    className={`marker-top-offset marker-pos-${position} w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium transition-all ${
                      isSelected
                        ? 'bg-red-500 border-2 border-white dark:border-gray-800 z-20'
                        : 'bg-gray-500 hover:bg-gray-600 z-10'
                    }`}
                    onClick={() => onMarkerClick(index)}
                    aria-label={`Map point ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No route data available</p>
          </div>
        )}
      </div>

      {/* Weather info for selected point */}
      {selectedMarker !== null && weatherData[selectedMarker] && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h4 className="font-medium mb-2">Point {selectedMarker + 1} Weather</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <span className="w-24 text-gray-600 dark:text-gray-400">Temperature:</span>
              <span className="font-medium">{weatherData[selectedMarker]?.temperature?.toFixed(1) || 'N/A'}°C</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600 dark:text-gray-400">Wind:</span>
              <span className="font-medium">{weatherData[selectedMarker]?.windSpeed?.toFixed(1) || 'N/A'} km/h</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600 dark:text-gray-400">Precipitation:</span>
              <span className="font-medium">{weatherData[selectedMarker]?.precipitation?.toFixed(1) || 'N/A'} mm</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600 dark:text-gray-400">Humidity:</span>
              <span className="font-medium">{weatherData[selectedMarker]?.humidity || 'N/A'}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
        Basic Map View
      </div>
    </div>
  );
}
