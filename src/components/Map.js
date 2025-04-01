import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Chart colors that we'll use for markers - soft, pale versions
const chartColors = [
  'rgb(255, 232, 238)',   // Soft pink for Temperature chart
  'hsl(265, 60%, 92%)',   // Soft purple for Humidity chart
  'hsl(45, 70%, 92%)',    // Soft yellow for Pressure chart
  'hsl(195, 60%, 92%)',   // Soft blue for Wind chart
  'hsl(345, 60%, 92%)',   // Soft red for Rain chart
  'hsl(160, 50%, 92%)',   // Soft green for Feels like chart
];

// Dark mode colors
const darkChartColors = [
  'rgb(130, 50, 70)',     // Deep pink for Temperature chart
  'hsl(265, 40%, 40%)',   // Deep purple for Humidity chart
  'hsl(45, 40%, 40%)',    // Deep yellow/amber for Pressure chart
  'hsl(195, 40%, 40%)',   // Deep blue for Wind chart
  'hsl(345, 40%, 40%)',   // Deep red for Rain chart
  'hsl(160, 30%, 40%)',   // Deep green for Feels like chart
];

// Create a custom marker with a specific color
const createColoredMarker = (color, darkColor, isSelected) => {
  // Detect dark mode
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const markerColor = isDarkMode ? darkColor : color;
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)';
  
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${markerColor};
        width: ${isSelected ? '24px' : '18px'};
        height: ${isSelected ? '24px' : '18px'};
        border-radius: 50%;
        border: 3px solid ${isSelected ? 'white' : borderColor};
        box-shadow: 0 0 ${isSelected ? '8px 3px' : '3px 1px'} rgba(0,0,0,0.3);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isSelected ? `<div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>` : ''}
        ${isSelected ? '<div style="position: absolute; top: -3px; left: -3px; right: -3px; bottom: -3px; border-radius: 50%; border: 2px solid white; animation: pulse 1.5s infinite;"></div>' : ''}
      </div>
    `,
    iconSize: [isSelected ? 30 : 24, isSelected ? 30 : 24],
    iconAnchor: [isSelected ? 15 : 12, isSelected ? 15 : 12],
    popupAnchor: [0, -15]
  });
};

const Map = ({ center, zoom, markers, selectedItem, onMarkerClick }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRefs = useRef({});
  const popupRefs = useRef({});
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;

    leafletMapRef.current = L.map(mapRef.current).setView(
      [center.lat, center.lng],
      zoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMapRef.current);

    // Add custom CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    setIsMapReady(true);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      document.head.removeChild(style);
    };
  }, []);

  // Add or update markers
  useEffect(() => {
    if (!isMapReady || !leafletMapRef.current) return;

    // Clear existing markers
    Object.values(markerRefs.current).forEach(marker => {
      if (leafletMapRef.current) {
        marker.removeFrom(leafletMapRef.current);
      }
    });
    markerRefs.current = {};
    popupRefs.current = {};

    // Add new markers
    markers.forEach((marker, index) => {
      const isSelected = selectedItem && selectedItem.id === marker.id;
      console.log(`Marker ${marker.id} isSelected: ${isSelected}`);

      // Use chart colors in a circular pattern
      const colorIndex = (marker.id - 1) % chartColors.length;
      const markerColor = chartColors[colorIndex];
      const darkMarkerColor = darkChartColors[colorIndex];
      
      const icon = createColoredMarker(markerColor, darkMarkerColor, isSelected);
      
      // Create popup content with styled elements
      const popupContent = `
        <div style="min-width: 200px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; color: ${markerColor}; font-size: 16px;">${marker.title}</h3>
          <p style="margin: 0; color: #333;">${marker.description || ''}</p>
        </div>
      `;
      
      const leafletMarker = L.marker([marker.position.lat, marker.position.lng], { icon })
        .addTo(leafletMapRef.current)
        .bindPopup(popupContent)
        .on('click', () => onMarkerClick(marker));
      
      markerRefs.current[marker.id] = leafletMarker;
      popupRefs.current[marker.id] = leafletMarker.getPopup();
      
      // Automatically open popup for selected marker
      if (isSelected) {
        console.log(`Opening popup for selected marker ${marker.id}`);
        leafletMarker.openPopup();
      }
    });
  }, [isMapReady, markers, selectedItem]);

  // Update map center when it changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.setView([center.lat, center.lng], zoom);
  }, [center, zoom]);

  // Open popup for selected marker
  useEffect(() => {
    if (!isMapReady || !leafletMapRef.current || !selectedItem) return;
    
    const marker = markerRefs.current[selectedItem.id];
    if (marker) {
      console.log(`Centering map on selected marker ${selectedItem.id}`);
      leafletMapRef.current.setView([selectedItem.position.lat, selectedItem.position.lng]);
      
      // Open popup with a small delay to ensure it appears after the map has centered
      setTimeout(() => {
        marker.openPopup();
      }, 100);
    }
  }, [selectedItem, isMapReady]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default Map;
