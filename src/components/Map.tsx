'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';
import { GPXData, RoutePoint } from '@/utils/gpxParser';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatDistance, formatDateTime, formatTemperature, formatWind, formatPrecipitation, getWeatherIconUrl, getMarkerColor } from '@/utils/helpers';

interface MapProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
}

// Need to fix Leaflet icon paths in Next.js
function fixLeafletIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

export default function Map({ gpxData, forecastPoints, weatherData, onMarkerClick, selectedMarker }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Fix Leaflet icon paths
    fixLeafletIcons();
    
    // Create map
    const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    
    // Create layers
    routeLayerRef.current = L.polyline([], { color: 'orange', weight: 5 }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    
    // Store map reference
    mapRef.current = map;
    
    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);
  
  // Update route when GPX data changes
  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current || !gpxData) return;
    
    setIsLoading(true);
    
    try {
      const map = mapRef.current;
      const routeLayer = routeLayerRef.current;
      const routePoints = gpxData.points;
      
      // Create route path
      const routePath = routePoints.map(point => [point.lat, point.lon] as L.LatLngExpression);
      routeLayer.setLatLngs(routePath);
      
      // Fit map to route bounds
      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
      
      // Animate route drawing
      const animate = () => {
        const length = routePath.length;
        let count = 0;
        
        const timer = setInterval(() => {
          count += Math.max(1, Math.floor(length / 100));
          if (count > length) {
            clearInterval(timer);
            setIsLoading(false);
            return;
          }
          
          routeLayer.setLatLngs(routePath.slice(0, count));
        }, 10);
      };
      
      animate();
    } catch (error) {
      console.error('Error updating route:', error);
      setIsLoading(false);
    }
  }, [gpxData]);
  
  // Update forecast markers when forecast data changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || forecastPoints.length === 0 || weatherData.length === 0) return;
    
    try {
      const markersLayer = markersLayerRef.current;
      
      // Clear existing markers
      markersLayer.clearLayers();
      
      // Add new markers
      forecastPoints.forEach((point, index) => {
        const weather = weatherData[index];
        if (!weather) return;
        
        // Create marker icon with custom color
        const markerColor = getMarkerColor(weather);
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        // Create marker with popup
        const marker = L.marker([point.lat, point.lon], { icon: markerIcon })
          .addTo(markersLayer)
          .on('click', () => onMarkerClick(index));
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <img src="${getWeatherIconUrl(weather.weatherIcon)}" alt="${weather.weatherDescription}" style="width: 50px; height: 50px;">
              <div>
                <div style="font-weight: bold; font-size: 16px;">${formatTemperature(weather.temperature)}</div>
                <div style="font-size: 12px;">Feels like: ${formatTemperature(weather.feelsLike)}</div>
              </div>
            </div>
            <div style="font-size: 14px; margin-bottom: 5px;"><b>Time:</b> ${formatDateTime(point.timestamp)}</div>
            <div style="font-size: 14px; margin-bottom: 5px;"><b>Distance:</b> ${formatDistance(point.distance)}</div>
            <div style="font-size: 14px; margin-bottom: 5px;"><b>Weather:</b> ${weather.weatherDescription}</div>
            <div style="font-size: 14px; margin-bottom: 5px;"><b>Wind:</b> ${formatWind(weather.windSpeed, weather.windDirection)}</div>
            <div style="font-size: 14px; margin-bottom: 5px;"><b>Humidity:</b> ${weather.humidity}%</div>
            <div style="font-size: 14px;"><b>Precipitation:</b> ${formatPrecipitation(weather.rain)}</div>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // If this is the selected marker, highlight it and open the popup
        if (selectedMarker === index) {
          // Center map on selected marker
          mapRef.current?.setView([point.lat, point.lon], mapRef.current.getZoom());
          
          // Open popup
          marker.openPopup();
        }
      });
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [forecastPoints, weatherData, selectedMarker, onMarkerClick]);
  
  // Center map function
  const centerMap = () => {
    if (!mapRef.current || !routeLayerRef.current || !gpxData) return;
    
    mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
  };
  
  return (
    <div className="relative h-[500px] rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      <Button 
        onClick={centerMap}
        className="absolute bottom-4 right-4 bg-orange-600 hover:bg-orange-700 shadow-lg z-[1000]"
        disabled={!gpxData}
      >
        <Crosshair className="mr-2 h-4 w-4" />
        Center Map
      </Button>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1001]">
          <div className="p-4 rounded-lg bg-neutral-900 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white">Loading route...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 