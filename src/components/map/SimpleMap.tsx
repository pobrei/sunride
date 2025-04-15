'use client';

import React, { useState, useEffect } from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface SimpleMapProps {
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
 * A simple map component that displays the route and weather data
 */
export default function SimpleMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker,
}: SimpleMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mapPoints, setMapPoints] = useState<{ x: number; y: number; index: number }[]>([]);
  const [routePoints, setRoutePoints] = useState<{ x: number; y: number }[]>([]);

  // Simulate map initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Calculate map points when data changes
  useEffect(() => {
    if (!gpxData || forecastPoints.length === 0) return;

    // Find min and max lat/lon to create a bounding box
    let minLat = Number.MAX_VALUE;
    let maxLat = Number.MIN_VALUE;
    let minLon = Number.MAX_VALUE;
    let maxLon = Number.MIN_VALUE;

    gpxData.points.forEach(point => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLon = Math.min(minLon, point.lon);
      maxLon = Math.max(maxLon, point.lon);
    });

    // Add some padding
    const latPadding = (maxLat - minLat) * 0.1;
    const lonPadding = (maxLon - minLon) * 0.1;

    minLat -= latPadding;
    maxLat += latPadding;
    minLon -= lonPadding;
    maxLon += lonPadding;

    // Calculate route points
    const routePointsArray = gpxData.points.map(point => {
      const x = ((point.lon - minLon) / (maxLon - minLon)) * 100;
      const y = 100 - ((point.lat - minLat) / (maxLat - minLat)) * 100;
      return { x, y };
    });

    setRoutePoints(routePointsArray);

    // Calculate forecast points
    const mapPointsArray = forecastPoints.map((point, index) => {
      const x = ((point.lon - minLon) / (maxLon - minLon)) * 100;
      const y = 100 - ((point.lat - minLat) / (maxLat - minLat)) * 100;
      return { x, y, index };
    });

    setMapPoints(mapPointsArray);
  }, [gpxData, forecastPoints]);

  if (isLoading) {
    return (
      <div className="h-full w-full bg-muted/20 flex items-center justify-center">
        <LoadingSpinner message="Initializing map..." centered variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
      {/* Map container */}
      <div className="h-full w-full relative">
        {/* Route line */}
        {routePoints.length > 1 && (
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={routePoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Markers */}
        {mapPoints.map(point => {
          // Round to nearest 10% for positioning
          const xPos = Math.round(point.x / 10) * 10;
          const yPos = Math.round(point.y / 10) * 10;

          return (
            <button
              type="button"
              key={point.index}
              className={cn(
                'absolute rounded-full flex items-center justify-center text-white font-medium transform -translate-x-1/2 -translate-y-1/2 transition-all',
                `marker-x-${xPos} marker-y-${yPos}`,
                point.index === selectedMarker
                  ? 'bg-blue-500 w-8 h-8 text-sm z-20 ring-4 ring-blue-300 dark:ring-blue-900'
                  : 'bg-slate-500 w-6 h-6 text-xs z-10 hover:bg-slate-600'
              )}
              onClick={() => onMarkerClick(point.index)}
              aria-label={`Map point ${point.index + 1}`}
            >
              {point.index + 1}
            </button>
          );
        })}

        {/* Grid lines for visual reference */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid-line-vertical-25 border-r border-slate-300 dark:border-slate-700"></div>
          <div className="grid-line-vertical-50 border-r border-slate-300 dark:border-slate-700"></div>
          <div className="grid-line-vertical-75 border-r border-slate-300 dark:border-slate-700"></div>

          <div className="grid-line-horizontal-25 border-b border-slate-300 dark:border-slate-700"></div>
          <div className="grid-line-horizontal-50 border-b border-slate-300 dark:border-slate-700"></div>
          <div className="grid-line-horizontal-75 border-b border-slate-300 dark:border-slate-700"></div>
        </div>

        {/* Map attribution */}
        <div className="absolute bottom-1 right-1 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-black/30 px-1 rounded">
          Simple Map View
        </div>
      </div>

      {/* Weather info panel */}
      {selectedMarker !== null && weatherData[selectedMarker] && (
        <div className="absolute bottom-2 left-2 right-2 md:left-auto md:right-2 md:w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-md shadow-md border border-slate-200 dark:border-slate-700 text-sm">
          <div className="font-medium mb-1">
            Point {selectedMarker + 1} of {forecastPoints.length}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>Temperature:</div>
            <div className="font-medium">
              {weatherData[selectedMarker]?.temperature.toFixed(1)}°C
            </div>

            <div>Feels Like:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.feelsLike.toFixed(1)}°C</div>

            <div>Wind:</div>
            <div className="font-medium">
              {weatherData[selectedMarker]?.windSpeed.toFixed(1)} km/h
            </div>

            <div>Precipitation:</div>
            <div className="font-medium">
              {weatherData[selectedMarker]?.precipitation.toFixed(1)} mm
            </div>

            <div>Humidity:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.humidity}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
