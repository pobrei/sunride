'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues
const fixLeafletIcons = () => {
  // Fix Leaflet's icon paths
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

interface LeafletMapProps {
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
 * A map component that uses Leaflet to display the route and weather data
 */
export default function LeafletMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeRef = useRef<L.Polyline | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    // Fix Leaflet icons
    fixLeafletIcons();
    if (!mapRef.current || leafletMap.current) return;

    // Create map instance
    leafletMap.current = L.map(mapRef.current).setView([0, 0], 2);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(leafletMap.current);

    setIsLoading(false);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update map when data changes
  useEffect(() => {
    if (!leafletMap.current || !gpxData || forecastPoints.length === 0) return;

    const map = leafletMap.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing route
    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    // Add route line
    if (gpxData.points.length > 0) {
      const routeCoords = gpxData.points.map(point => [point.lat, point.lon] as [number, number]);

      routeRef.current = L.polyline(routeCoords, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
      }).addTo(map);

      // Fit map to route bounds
      map.fitBounds(routeRef.current.getBounds(), {
        padding: [50, 50],
        maxZoom: 14,
      });
    }

    // Add markers for forecast points
    forecastPoints.forEach((point, index) => {
      // Create custom icon based on whether this marker is selected
      const isSelected = index === selectedMarker;

      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="${isSelected ? 'marker-selected' : 'marker-normal'}">${index + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([point.lat, point.lon], { icon: markerIcon })
        .addTo(map)
        .on('click', () => onMarkerClick(index));

      // Add popup with weather info
      if (weatherData[index]) {
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

  }, [gpxData, forecastPoints, weatherData, selectedMarker, onMarkerClick]);

  // Update marker styles when selected marker changes
  useEffect(() => {
    if (!leafletMap.current) return;

    markersRef.current.forEach((marker, index) => {
      const isSelected = index === selectedMarker;

      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="${isSelected ? 'marker-selected' : 'marker-normal'}">${index + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      marker.setIcon(markerIcon);

      // Open popup for selected marker
      if (isSelected) {
        marker.openPopup();
      } else {
        marker.closePopup();
      }
    });

  }, [selectedMarker]);

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

  return (
    <div className="h-full w-full relative">
      {/* Map container */}
      <div className="h-full w-full" ref={mapRef}></div>

      {/* Weather info panel */}
      {selectedMarker !== null && weatherData[selectedMarker] && (
        <div className="absolute bottom-2 left-2 right-2 md:left-auto md:right-2 md:w-64 bg-background/90 backdrop-blur-sm p-3 rounded-md shadow-md border border-border text-sm">
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
            <div className="font-medium">{weatherData[selectedMarker]?.humidity}%</div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .marker-normal {
          width: 24px;
          height: 24px;
          background-color: #64748b;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        }

        .marker-selected {
          width: 30px;
          height: 30px;
          background-color: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
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

        .dark .leaflet-container {
          background: #1a1a1a;
        }

        .dark .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.5);
          color: #ccc;
        }

        .dark .leaflet-control-attribution a {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
