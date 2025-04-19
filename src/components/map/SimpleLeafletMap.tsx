'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GPXData, ForecastPoint } from '@/types';
import { Locate, Wind, Droplets, CloudRain, Sun, Gauge, Cloud } from 'lucide-react';
import { responsive } from '@/styles/tailwind-utils';
import './MapStyles.css';
import './WeatherCardFix.css';

// Import Leaflet types but use dynamic import for the actual library
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet';

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
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Generate an SVG arrow for wind direction
 * @param degrees - Wind direction in degrees (meteorological, 0 = N, 90 = E, etc.)
 * @param windSpeed - Wind speed in km/h
 * @param isSelected - Whether this is the selected marker
 * @returns SVG string for the wind direction arrow
 */
function getWindArrowSVG(degrees: number, windSpeed: number, isSelected: boolean): string {
  // Convert meteorological degrees to mathematical degrees (0 = E, 90 = N, etc.)
  // Meteorological: 0 = N, 90 = E, 180 = S, 270 = W
  // Mathematical: 0 = E, 90 = N, 180 = W, 270 = S
  // So we need to subtract 90 and take the modulo
  const mathDegrees = (degrees - 90 + 360) % 360;

  // Scale arrow size based on wind speed (min 10px, max 24px)
  const baseSize = isSelected ? 20 : 16;
  const minSize = baseSize;
  const maxSize = baseSize * 1.5;
  const size = Math.min(maxSize, minSize + (windSpeed / 10) * 5);

  // Calculate arrow color based on wind speed
  let color = '#4299e1'; // Default blue
  if (windSpeed > 30) {
    color = '#e53e3e'; // Red for strong wind
  } else if (windSpeed > 20) {
    color = '#ed8936'; // Orange for moderate wind
  } else if (windSpeed > 10) {
    color = '#48bb78'; // Green for light wind
  }

  // Create SVG for the arrow
  return `
    <svg
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style="transform: rotate(${mathDegrees}deg); position: absolute; top: -${size/2}px; left: ${isSelected ? '20px' : '14px'};"
      class="wind-arrow"
    >
      <path
        d="M12 2L12 19M12 19L7 14M12 19L17 14"
        stroke="${color}"
        stroke-width="${isSelected ? 3 : 2}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
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
export default function SimpleLeafletMap(props: SimpleLeafletMapProps): React.ReactElement {
  const {
    gpxData,
    forecastPoints = [],
    weatherData = [],
    onMarkerClick = () => {},
    selectedMarker = null,
  } = props;

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
        // @ts-expect-error - Leaflet types issue with _getIconUrl
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

          // Add OpenCycleMap tile layer (better for cycling routes)
          L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38', {
            attribution:
              '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);

          // Add layer control with multiple map options
          const baseMaps = {
            "Cycle Map": L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38', {
              attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }),
            "Standard Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }),
            "Terrain Map": L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38', {
              attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }),
          };

          // Add layer control to the map
          L.control.layers(baseMaps, {}, {
            position: 'topright',
            collapsed: true,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        color: '#00C2A8', // Primary color (hardcoded for consistency)
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: undefined,
        smoothFactor: 1.5,
        // Add a white outline to make the route more visible on the map
        className: 'route-path-with-outline',
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

      // Get wind data for this point
      const weather = weatherData && weatherData[index];
      const windDirection = weather?.windDirection || 0;
      const windSpeed = weather?.windSpeed || 0;

      // Generate wind arrow SVG
      const windArrow = getWindArrowSVG(windDirection, windSpeed, isSelected);

      // Create custom icon with wind direction arrow
      const icon = L.divIcon({
        className: 'custom-marker-icon',
        html: `
          <div class="marker-container">
            <div class="${isSelected ? 'marker-selected' : 'marker-normal'} transition-all duration-300">${index + 1}</div>
            ${windArrow}
          </div>
        `,
        iconSize: [isSelected ? 60 : 50, isSelected ? 60 : 50],
        iconAnchor: [isSelected ? 30 : 25, isSelected ? 30 : 25],
      });

      // Create marker
      const marker = L.marker([point.lat, point.lon], { icon })
        .addTo(map)
        .on('click', () => {
          if (onMarkerClick) onMarkerClick(index);
        });

      // Add popup with weather info
      if (weather) {
        const windDirectionText = getWindDirection(windDirection);
        marker.bindPopup(`
          <div class="weather-popup">
            <div class="weather-temp">${weather.temperature?.toFixed(1) || 'N/A'}°C</div>
            <div class="weather-wind">
              ${weather.windSpeed?.toFixed(1) || 'N/A'} km/h
              <span class="wind-direction">${windDirectionText}</span>
            </div>
            <div class="weather-wind-arrow">
              ${getWindArrowSVG(windDirection, windSpeed, false).replace('position: absolute; top: -8px; left: 14px;', 'display: inline-block; vertical-align: middle; margin-right: 4px;')}
              <span>Wind direction</span>
            </div>
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
        .marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-normal {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background-color: white;
          color: hsl(var(--foreground));
          font-weight: 500;
          border: 2px solid hsl(var(--border));
          border-radius: 50%;
          font-size: 12px;
          z-index: 400;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .marker-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          font-weight: 600;
          border: none;
          border-radius: 50%;
          font-size: 14px;
          z-index: 500;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          transform: scale(1.1);
        }
        .wind-arrow {
          z-index: 450;
          filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.2));
          transition: all 0.3s ease;
        }
        .weather-popup {
          text-align: center;
          padding: 10px;
          min-width: 140px;
        }
        .weather-temp {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 6px;
        }
        .weather-wind {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
          margin-bottom: 8px;
        }
        .wind-direction {
          font-weight: 500;
          margin-left: 4px;
        }
        .weather-wind-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: hsl(var(--muted-foreground));
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px dashed rgba(0,0,0,0.1);
        }
        .leaflet-popup-content-wrapper {
          padding: 0;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .leaflet-popup-content {
          margin: 8px;
        }
        .leaflet-container {
          font: inherit;
        }
        /* Dark mode support */
        .dark .leaflet-tile {
          filter: brightness(0.8) contrast(1.2) saturate(0.8);
        }
        /* Layer control styling */
        .leaflet-control-layers {
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        .leaflet-control-layers-toggle {
          width: 36px !important;
          height: 36px !important;
          background-size: 20px 20px !important;
        }
        .leaflet-control-layers-expanded {
          padding: 8px !important;
          background-color: white !important;
          color: black !important;
        }
        .dark .leaflet-control-layers-expanded {
          background-color: hsl(var(--card)) !important;
          color: white !important;
        }
        /* Route path styling with outline */
        .route-path-with-outline {
          stroke-width: 5px;
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
        }
        .dark .route-path-with-outline {
          filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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

  // Render placeholder if no data
  const noDataContent = (
    <div
      className={cn(
        responsive.mapContainer,
        'bg-muted flex items-center justify-center max-w-7xl mx-auto'
      )}
    >
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

  // Render map or placeholder based on data availability
  return (
    <div className="h-full w-full relative z-0">
      {!gpxData || forecastPoints.length === 0 ? (
        noDataContent
      ) : (
        <>
          <div ref={mapContainerRef} className={cn(responsive.mapContainer, 'w-full overflow-hidden animate-fade-in shadow-lg border border-border/20')}></div>

          {/* Center map button - iOS 19 style */}
          <div className="absolute top-4 right-4 z-[500]">
            <Button
              onClick={centerMap}
              size="icon"
              variant="ghost"
              data-slot="button"
              className="map-control-button bg-white/80 dark:bg-card/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg button-press rounded-full w-10 h-10 border border-border/20 shadow-sm"
              aria-label="Center map"
              title="Center map on route"
            >
              <Locate className="h-5 w-5 text-primary" />
            </Button>
          </div>

          {/* Enhanced Weather info panel */}
          {selectedMarker !== null && weatherData && weatherData[selectedMarker] && (
            <Card className="absolute top-16 right-4 md:w-96 z-[400] p-0 bg-white/90 dark:bg-card/90 backdrop-blur-md shadow-lg rounded-2xl border border-border/30 max-h-[70vh] overflow-y-auto transition-all duration-300 animate-slide-up">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-xs flex items-center">
                    <div className="w-6 h-6 bg-primary/90 rounded-full flex items-center justify-center text-primary-foreground text-xs mr-1.5 shadow-md ring-1 ring-primary/20 animate-pulse">
                      {selectedMarker + 1}
                    </div>
                    <span className="text-muted-foreground font-medium">of {forecastPoints.length}</span>
                  </div>
                  <div className="text-3xl">
                    {getWeatherIconEmoji(weatherData[selectedMarker]?.conditionCode || 800)}
                  </div>
                </div>

                <div className="mb-4 bg-primary/5 p-3 rounded-xl">
                  <div className="text-xl font-semibold flex items-baseline">
                    {weatherData[selectedMarker]?.temperature?.toFixed(1) || 'N/A'}°C
                    <span className="text-xs font-medium text-muted-foreground ml-2">
                      Feels like {weatherData[selectedMarker]?.feelsLike?.toFixed(1) || 'N/A'}°C
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground capitalize mt-1 font-medium">
                    {weatherData[selectedMarker]?.conditionDescription || weatherData[selectedMarker]?.weatherDescription || 'Clear sky'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                  <div className="col-span-2 pb-1 mb-1">
                    <span className="font-semibold text-foreground/90 text-base">Weather Details</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <Wind className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Wind</div>
                      <div className="font-semibold text-sm">
                        {((weatherData[selectedMarker]?.windSpeed || 0) / 3.6).toFixed(1)} m/s
                        <span className="text-xs text-muted-foreground ml-1">
                          {getWindDirection(weatherData[selectedMarker]?.windDirection || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <Droplets className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Humidity</div>
                      <div className="font-semibold text-sm">
                        {weatherData[selectedMarker]?.humidity || 'N/A'}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <CloudRain className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Precipitation</div>
                      <div className="font-semibold text-sm">
                        {weatherData[selectedMarker]?.precipitation?.toFixed(1) || '0'} mm
                        {(weatherData[selectedMarker]?.precipitationProbability || 0) > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({((weatherData[selectedMarker]?.precipitationProbability || 0) * 100).toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">UV Index</div>
                      <div className="font-semibold text-sm">
                        {weatherData[selectedMarker]?.uvIndex?.toFixed(1) || 'N/A'}
                        <span className="text-xs text-muted-foreground ml-1">
                          {getUVIndexCategory(weatherData[selectedMarker]?.uvIndex || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center">
                      <Gauge className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Pressure</div>
                      <div className="font-semibold text-sm">
                        {weatherData[selectedMarker]?.pressure || 'N/A'} hPa
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center">
                      <Cloud className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Cloud Cover</div>
                      <div className="font-semibold text-sm">
                        {weatherData[selectedMarker]?.cloudCover !== undefined ? `${weatherData[selectedMarker]?.cloudCover}%` : '0%'}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 pt-2 mt-1 border-t border-border/30 text-xs text-center font-medium text-muted-foreground">
                    {forecastPoints[selectedMarker] && (
                      <span>Distance: {forecastPoints[selectedMarker].distance.toFixed(1)} km</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
