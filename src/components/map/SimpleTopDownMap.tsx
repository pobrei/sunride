'use client';

import React, { useState, useEffect } from 'react';
import './map.css';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SimpleTopDownMapProps {
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
 * A simple top-down map component that displays the route and weather data
 */
export default function SimpleTopDownMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker
}: SimpleTopDownMapProps) {
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

    // For a true top-down view (North at the top), we need to:
    // - X coordinate increases as longitude increases (East)
    // - Y coordinate increases as latitude decreases (South)

    // Calculate route points
    const routePointsArray = gpxData.points.map(point => {
      // X coordinate: map longitude to horizontal position (0-100%)
      const x = ((point.lon - minLon) / (maxLon - minLon)) * 100;
      // Y coordinate: map latitude to vertical position (0-100%)
      // Subtract from 100 to invert Y axis (North at top)
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
        <LoadingSpinner
          message="Initializing map..."
          centered
          variant="spinner"
          size="lg"
        />
      </div>
    );
  }

  // If there's no GPX data, show a placeholder
  if (!gpxData || forecastPoints.length === 0) {
    return (
      <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No Route Data</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Upload a GPX file to visualize your route on the map with weather data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      {/* Map container */}
      <div className="h-full w-full relative">
        {/* Route line */}
        {routePoints.length > 1 && (
          <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none">
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
        {mapPoints.map((point) => {
          // Round to nearest 10% for positioning
          const xPos = Math.round(point.x / 10) * 10;
          const yPos = Math.round(point.y / 10) * 10;

          return (
            <button
              key={point.index}
              type="button"
              className={`map-marker marker-x-${xPos} marker-y-${yPos} ${point.index === selectedMarker ? 'map-marker-selected' : 'map-marker-normal'}`}
              onClick={() => onMarkerClick(point.index)}
              aria-label={`Map point ${point.index + 1}`}
            >
              {point.index + 1}
            </button>
          );
        })}

        {/* Grid lines for visual reference */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="map-grid-vertical-1"></div>
          <div className="map-grid-vertical-2"></div>
          <div className="map-grid-vertical-3"></div>
          <div className="map-grid-horizontal-1"></div>
          <div className="map-grid-horizontal-2"></div>
          <div className="map-grid-horizontal-3"></div>
        </div>

        {/* Map attribution */}
        <div className="map-attribution">
          Top-Down Map View
        </div>
      </div>

      {/* Weather info panel */}
      {selectedMarker !== null && weatherData[selectedMarker] && (
        <div className="map-info-panel">
          <div className="font-medium mb-1">Point {selectedMarker + 1} of {forecastPoints.length}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>Temperature:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.temperature?.toFixed(1) || 'N/A'}°C</div>

            <div>Feels Like:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.feelsLike?.toFixed(1) || 'N/A'}°C</div>

            <div>Wind:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.windSpeed?.toFixed(1) || 'N/A'} km/h</div>

            <div>Precipitation:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.precipitation?.toFixed(1) || 'N/A'} mm</div>

            <div>Humidity:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.humidity || 'N/A'}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
