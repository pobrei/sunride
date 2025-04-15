'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGPXContext } from '@/features/gpx/context/GPXContext';
import { useWeatherContext } from '@/features/weather/context/WeatherContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';

// Fix for Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
  // Only run on client side
  if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });
  }
};

interface MapControllerProps {
  bounds?: L.LatLngBoundsExpression;
}

const MapController: React.FC<MapControllerProps> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);

  return null;
};

interface EnhancedLeafletMapProps {
  selectedMarker: number | null;
  onMarkerClick: (index: number) => void;
}

const EnhancedLeafletMap: React.FC<EnhancedLeafletMapProps> = ({
  selectedMarker,
  onMarkerClick,
}) => {
  const { gpxData } = useGPXContext();
  const { weatherData } = useWeatherContext();
  const { theme } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Fix Leaflet icons
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Set map ready state
  useEffect(() => {
    if (mapRef.current) {
      setIsMapReady(true);
    }
  }, [mapRef.current]);

  // Prepare route path data
  const routePath = gpxData?.points.map(point => [point.lat, point.lon] as [number, number]) || [];
  
  // Prepare bounds
  const bounds = gpxData
    ? [
        [gpxData.bounds.minLat, gpxData.bounds.minLon],
        [gpxData.bounds.maxLat, gpxData.bounds.maxLon],
      ] as L.LatLngBoundsExpression
    : undefined;

  // Prepare forecast points (simplified for this example)
  const forecastPoints = gpxData?.points.filter((_, i) => i % 50 === 0) || [];

  // Get weather marker color based on temperature
  const getMarkerColor = (temp: number | undefined) => {
    if (temp === undefined) return 'gray';
    if (temp < 0) return 'blue';
    if (temp < 10) return 'lightblue';
    if (temp < 20) return 'green';
    if (temp < 30) return 'orange';
    return 'red';
  };

  // Create custom marker icon
  const createMarkerIcon = (color: string, isSelected: boolean) => {
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="
        width: ${isSelected ? '14px' : '10px'};
        height: ${isSelected ? '14px' : '10px'};
        background-color: ${color};
        border: ${isSelected ? '3px' : '2px'} solid white;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
      iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7],
    });
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[51.505, -0.09]} // Default center
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={theme === 'dark' 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color={theme === 'dark' ? '#60a5fa' : '#3b82f6'}
            weight={4}
            opacity={0.7}
          />
        )}

        {forecastPoints.map((point, index) => {
          const weather = weatherData?.[index];
          const temp = weather?.temperature;
          const color = getMarkerColor(temp);
          const isSelected = selectedMarker === index;

          return (
            <Marker
              key={`marker-${index}`}
              position={[point.lat, point.lon]}
              icon={createMarkerIcon(color, isSelected)}
              eventHandlers={{
                click: () => onMarkerClick(index),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Point {index + 1}</div>
                  {weather && (
                    <>
                      <div>Temperature: {weather.temperature}°C</div>
                      <div>Weather: {weather.weatherDescription}</div>
                      {weather.windSpeed && (
                        <div>Wind: {weather.windSpeed} km/h</div>
                      )}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {bounds && <MapController bounds={bounds} />}
      </MapContainer>
    </div>
  );
};

export default EnhancedLeafletMap;
