'use client';

import React, { useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Using .jsx extension to avoid TypeScript issues with Leaflet

/**
 * A simple Leaflet map component that displays the route and weather data
 */
export default function SimpleLeafletMap(props) {
  const { gpxData, forecastPoints, weatherData, onMarkerClick, selectedMarker } = props;
  
  // Refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);
  
  // State refs to avoid dependency issues
  const selectedMarkerRef = useRef(selectedMarker);
  
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
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
  const updateMap = (L) => {
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
    if (gpxData.points.length > 0) {
      const routeCoords = gpxData.points.map(point => [point.lat, point.lon]);
      
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
        iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
        iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
      });
      
      // Create marker
      const marker = L.marker([point.lat, point.lon], { icon })
        .addTo(map)
        .on('click', () => {
          onMarkerClick(index);
        });
      
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
    
    console.log('SimpleLeafletMap: Map updated successfully');
  };
  
  // Add CSS for markers
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const styleId = 'leaflet-custom-styles';
    
    // Only add styles once
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
          background-color: #64748b;
          color: white;
          font-weight: 500;
          border-radius: 50%;
          font-size: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        .marker-normal:hover {
          background-color: #475569;
          transform: scale(1.1);
        }
        .marker-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: #3b82f6;
          color: white;
          font-weight: 600;
          border-radius: 50%;
          font-size: 14px;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
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
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Clean up styles on unmount
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  // Render placeholder if no data
  if (!gpxData || forecastPoints.length === 0) {
    return (
      <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No Route Data</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Upload a GPX file to visualize your route on the map with weather data
          </p>
        </div>
      </div>
    );
  }
  
  // Render map
  return (
    <div className="h-full w-full relative">
      <div ref={mapContainerRef} className="h-full w-full"></div>
      
      {/* Weather info panel */}
      {selectedMarker !== null && weatherData[selectedMarker] && (
        <div className="absolute bottom-2 left-2 right-2 md:left-auto md:right-2 md:w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-md shadow-md border border-slate-200 dark:border-slate-700 text-sm z-[1000]">
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
          </div>
        </div>
      )}
    </div>
  );
}
