'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GPXData, ForecastPoint } from '@/types';
import { Locate } from 'lucide-react';
import { responsive } from '@/styles/tailwind-utils';
import './MapStyles.css';

// Import Leaflet types but use dynamic import for the actual library
import type { Map as LeafletMap, Marker, Polyline, DivIcon } from 'leaflet';

interface WeatherDataPoint {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  precipitationProbability?: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  weatherCode: number;
  conditionCode?: number;
  weatherDescription: string;
  conditionDescription?: string;
  weatherIcon: string;
  time: string;
}

/**
 * Get weather icon emoji based on condition code
 */
function getWeatherIconEmoji(conditionCode: number): string {
  // Weather condition codes based on OpenWeatherMap API
  // https://openweathermap.org/weather-conditions

  // Thunderstorm
  if (conditionCode >= 200 && conditionCode < 300) return '⛈️';

  // Drizzle
  if (conditionCode >= 300 && conditionCode < 400) return '🌦️';

  // Rain
  if (conditionCode >= 500 && conditionCode < 600) {
    if (conditionCode === 511) return '🌨️'; // Freezing rain
    return '🌧️';
  }

  // Snow
  if (conditionCode >= 600 && conditionCode < 700) return '❄️';

  // Atmosphere (fog, mist, etc.)
  if (conditionCode >= 700 && conditionCode < 800) return '🌫️';

  // Clear
  if (conditionCode === 800) return '☀️';

  // Clouds
  if (conditionCode > 800 && conditionCode < 900) {
    if (conditionCode === 801) return '🌤️'; // Few clouds
    if (conditionCode === 802) return '⛅'; // Scattered clouds
    return '☁️'; // Broken or overcast clouds
  }

  return '🌡️'; // Default
}

/**
 * Get wind direction as a cardinal direction
 */
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get UV index category
 */
function getUVIndexCategory(uvIndex: number): string {
  if (uvIndex < 3) return 'Low';
  if (uvIndex < 6) return 'Moderate';
  if (uvIndex < 8) return 'High';
  if (uvIndex < 11) return 'Very High';
  return 'Extreme';
}

interface SimpleLeafletMapProps {
  gpxData?: GPXData;
  forecastPoints: ForecastPoint[];
  weatherData?: WeatherDataPoint[];
  onMarkerClick?: (index: number) => void;
  selectedMarker?: number | null;
}

/**
 * A simple Leaflet map component that displays the route and weather data
 */
export default function SimpleLeafletMap(props: SimpleLeafletMapProps): React.ReactNode {
  const { gpxData, forecastPoints = [], weatherData = [], onMarkerClick = () => {}, selectedMarker = null } = props;

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const routeRef = useRef<Polyline | null>(null);

  // State refs to avoid dependency issues
  const selectedMarkerRef = useRef<number | null>(selectedMarker);

  // Update ref when prop changes
  useEffect(() => {
    selectedMarkerRef.current = selectedMarker;
  }, [selectedMarker]);

  // Initialize map on mount
  useEffect(() => {
    // Only run this on the client
    if (typeof window === 'undefined') return;

    console.log('SimpleLeafletMap: Initializing map...');

    // Load Leaflet dynamically
    const initMap = async () => {
      try {
        // Import Leaflet
        const L = await import('leaflet');

        // Add Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Fix Leaflet icon paths
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Create map if it doesn't exist
        if (!mapRef.current && mapContainerRef.current) {
          console.log('SimpleLeafletMap: Creating new map instance');

          // Create map instance
          mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);

          console.log('SimpleLeafletMap: Map created successfully');
        }

        // Update map with data if available
        if (gpxData && forecastPoints.length > 0) {
          updateMap(L);
        }
      } catch (error) {
        console.error('SimpleLeafletMap: Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        console.log('SimpleLeafletMap: Cleaning up map');
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map when data changes
  useEffect(() => {
    if (!mapRef.current || !gpxData || forecastPoints.length === 0) {
      return;
    }

    console.log('SimpleLeafletMap: Updating map with data');

    const updateMapData = async () => {
      const L = await import('leaflet');
      updateMap(L);
    };

    updateMapData();
  }, [gpxData, forecastPoints, weatherData, selectedMarker]);

  // Function to update the map with route and markers
  const updateMap = (L: typeof import('leaflet')): void => {
    if (!mapRef.current || !gpxData) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing route
    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    // Add route line
    if (gpxData.points && gpxData.points.length > 0) {
      const routeCoords = gpxData.points.map(point => [point.lat, point.lon] as [number, number]);

      routeRef.current = L.polyline(routeCoords, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Fit map to route bounds
      map.fitBounds(routeRef.current.getBounds(), {
        padding: [50, 50],
        maxZoom: 14,
      });
    }

    // Add markers for forecast points
    forecastPoints.forEach((point, index) => {
      const isSelected = index === selectedMarkerRef.current;

      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="${isSelected ? 'marker-selected' : 'marker-normal'}">${index + 1}</div>`,
        iconSize: [isSelected ? 36 : 24, isSelected ? 36 : 24],
        iconAnchor: [isSelected ? 18 : 12, isSelected ? 18 : 12],
      });

      // Create marker
      const marker = L.marker([point.lat, point.lon], { icon })
        .addTo(map)
        .on('click', () => {
          if (onMarkerClick) onMarkerClick(index);
        });

      // Add popup with weather info
      if (weatherData && weatherData[index]) {
        const weather = weatherData[index];
        marker.bindPopup(`
          <div class="weather-popup">
            <div class="weather-temp">${weather?.temperature?.toFixed(1) || 'N/A'}°C</div>
            <div class="weather-wind">${weather?.windSpeed?.toFixed(1) || 'N/A'} km/h</div>
          </div>
        `);
      }

      markersRef.current.push(marker);
    });

    console.log('SimpleLeafletMap: Map updated successfully');
  };

  // Add CSS for markers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const styleId = 'leaflet-custom-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .custom-marker-icon {
          background: transparent;
          border: none;
        }
        .marker-normal {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #3b82f6;
          color: white;
          font-weight: 500;
          border-radius: 50%;
          font-size: 12px;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          z-index: 400;
        }
        .marker-normal:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 3px 6px rgba(0, 0, 0, 0.2);
        }
        .marker-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background-color: #2563eb;
          color: white;
          font-weight: 600;
          border-radius: 50%;
          font-size: 14px;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          z-index: 500;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }
        .weather-popup {
          text-align: center;
          padding: 4px;
        }
        .weather-temp {
          font-weight: bold;
          font-size: 14px;
        }
        .weather-wind {
          font-size: 12px;
          color: #64748b;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 8px;
        }
        .leaflet-container {
          font: inherit;
        }
        /* Dark mode support */
        .dark .leaflet-tile {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Render placeholder if no data
  if (!gpxData || forecastPoints.length === 0) {
    return (
      <div className={cn(responsive.mapContainer, "bg-muted flex items-center justify-center max-w-7xl mx-auto")}>
        <Card className="w-full max-w-md mx-auto">
          <div className="text-center p-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-4">No Route Data</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Upload a GPX file to visualize your route on the map with weather data
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Function to center the map on the route
  const centerMap = useCallback(async () => {
    if (!mapRef.current || !routeRef.current) return;

    try {
      // Center the map on the route bounds
      mapRef.current.fitBounds(routeRef.current.getBounds(), {
        padding: [50, 50],
        maxZoom: 14,
      });
    } catch (error) {
      console.error('Error centering map:', error);
    }
  }, []);

  // Render map
  return (
    <div className="h-full w-full relative">
      <div ref={mapContainerRef} className={cn(responsive.mapContainer, "w-full")}></div>

      {/* Center map button */}
      <Button
        onClick={centerMap}
        size="icon"
        variant="secondary"
        className="absolute top-3 right-3 z-[1000] bg-theme-card/80 backdrop-blur-sm hover:bg-theme-accent text-theme-text hover:text-white shadow-md map-control-button"
        aria-label="Center map"
      >
        <Locate className="h-4 w-4" />
      </Button>

      {/* Enhanced Weather info panel */}
      {selectedMarker !== null && weatherData && weatherData[selectedMarker] && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[1000] p-0 bg-background/80 backdrop-blur-sm shadow-lg border-primary/20 max-h-[80vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-medium text-sm flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs mr-2">
                  {selectedMarker + 1}
                </div>
                <span>Point {selectedMarker + 1} of {forecastPoints.length}</span>
              </div>
              <div className="text-2xl">
                {getWeatherIconEmoji(weatherData[selectedMarker]?.conditionCode || 800)}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-lg font-semibold">
                {weatherData[selectedMarker]?.temperature?.toFixed(1) || 'N/A'}°C
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  Feels like {weatherData[selectedMarker]?.feelsLike?.toFixed(1) || 'N/A'}°C
                </span>
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {weatherData[selectedMarker]?.conditionDescription || 'Unknown'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div className="col-span-2 pb-2 mb-2 border-b border-border">
                <span className="font-medium">Weather Details</span>
              </div>

              <div className="text-muted-foreground">Wind:</div>
              <div className="font-medium">
                {weatherData[selectedMarker]?.windSpeed?.toFixed(1) || 'N/A'} km/h
                <span className="text-xs text-muted-foreground ml-1">
                  {getWindDirection(weatherData[selectedMarker]?.windDirection || 0)}
                </span>
              </div>

              <div className="text-muted-foreground">Humidity:</div>
              <div className="font-medium">
                {weatherData[selectedMarker]?.humidity || 'N/A'}%
              </div>

              <div className="text-muted-foreground">Precipitation:</div>
              <div className="font-medium">
                {weatherData[selectedMarker]?.precipitation?.toFixed(1) || '0'} mm
                {weatherData[selectedMarker]?.precipitationProbability > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({(weatherData[selectedMarker]?.precipitationProbability * 100).toFixed(0)}%)
                  </span>
                )}
              </div>

              <div className="text-muted-foreground">UV Index:</div>
              <div className="font-medium">
                {weatherData[selectedMarker]?.uvIndex?.toFixed(1) || 'N/A'}
                <span className="text-xs text-muted-foreground ml-1">
                  {getUVIndexCategory(weatherData[selectedMarker]?.uvIndex || 0)}
                </span>
              </div>

              <div className="text-muted-foreground">Pressure:</div>
              <div className="font-medium">
                {weatherData[selectedMarker]?.pressure || 'N/A'} hPa
              </div>

              <div className="text-muted-foreground">Visibility:</div>
              <div className="font-medium">
                {((weatherData[selectedMarker]?.visibility || 0) / 1000).toFixed(1)} km
              </div>

              <div className="col-span-2 pt-2 mt-2 border-t border-border text-xs text-center text-muted-foreground">
                {forecastPoints[selectedMarker] && (
                  <span>Distance: {forecastPoints[selectedMarker].distance.toFixed(1)} km</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
