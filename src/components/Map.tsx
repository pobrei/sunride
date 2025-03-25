'use client';

import { useEffect, useRef, useState } from 'react';
import { GPXData, RoutePoint } from '@/utils/gpxParser';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatDistance, formatDateTime, formatTemperature, formatWind, formatPrecipitation, getWeatherIconUrl, getMarkerColor } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';
import dynamic from 'next/dynamic';

interface MapProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
}

// Create a client-only map wrapper that will only load on the client
const MapContent = ({ gpxData, forecastPoints, weatherData, onMarkerClick, selectedMarker }: MapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [reactLeafletComponents, setReactLeafletComponents] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);

  // Load Leaflet and React-Leaflet dynamically on the client
  useEffect(() => {
    console.log('Loading Leaflet and React Leaflet dynamically...');
    
    Promise.all([
      import('leaflet'),
      import('react-leaflet'),
      // @ts-ignore - CSS import
      import('leaflet/dist/leaflet.css')
    ]).then(([L, ReactLeaflet]) => {
      console.log('Leaflet loaded:', L);
      console.log('React Leaflet loaded:', ReactLeaflet);
      
      const leafletInstance = L.default || L;
      
      // Fix icon paths
      delete leafletInstance.Icon.Default.prototype._getIconUrl;
      leafletInstance.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      
      setLeaflet(leafletInstance);
      setReactLeafletComponents(ReactLeaflet);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error loading Leaflet or React Leaflet:', error);
      setIsLoading(false);
    });
  }, []);

  // If still loading libraries or no gpx data, show loading state
  if (isLoading || !reactLeafletComponents || !leaflet || !gpxData) {
    return (
      <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth">
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="p-6 rounded-xl bg-card shadow-lg animate-pulse">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-foreground font-medium text-lg">
                {isLoading ? 'Loading map components...' : 'Waiting for route data...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Once libraries are loaded and data is available, render the map
  const { MapContainer, TileLayer, Polyline, LayerGroup, Marker, Popup, useMap } = reactLeafletComponents;
  const L = leaflet;

  // Create route path
  const routePath = gpxData.points.map(point => [point.lat, point.lon] as [number, number]);
  
  // Find bounds of the route
  const bounds = L.latLngBounds(routePath);

  // Component to center map on bounds
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      if (map && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [map]);
    
    return null;
  };
  
  // Component to handle marker click
  const MapMarkers = () => {
    const map = useMap();
    
    useEffect(() => {
      // If there's a selected marker, center the map on it
      if (selectedMarker !== null && forecastPoints[selectedMarker]) {
        const point = forecastPoints[selectedMarker];
        map.setView([point.lat, point.lon], map.getZoom());
      }
    }, [selectedMarker, map]);
    
    return (
      <LayerGroup>
        {forecastPoints.map((point, index) => {
          const weather = weatherData[index];
          if (!weather) return null;
          
          // Create marker icon with custom color
          const markerColor = getMarkerColor(weather);
          const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);">${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
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
          
          return (
            <Marker 
              key={`marker-${index}`}
              position={[point.lat, point.lon]} 
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  onMarkerClick(index);
                }
              }}
            >
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: popupContent }} />
              </Popup>
            </Marker>
          );
        })}
      </LayerGroup>
    );
  };
  
  // Custom center map button component
  const CenterMapButton = () => {
    const map = useMap();
    
    const centerMap = () => {
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };
    
    return (
      <Button 
        onClick={centerMap}
        className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 shadow-lg z-[1000] transition-all hover:scale-105 active:scale-95"
      >
        <Crosshair className="mr-2 h-4 w-4" />
        Center Map
      </Button>
    );
  };

  return (
    <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth">
      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <Polyline positions={routePath} color="hsl(var(--primary))" weight={5} opacity={0.8} />
        <MapMarkers />
        <MapController />
        <CenterMapButton />
      </MapContainer>
    </div>
  );
};

// Create a dynamic component with SSR disabled
const Map = dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
}) as React.ComponentType<MapProps>;

export default Map; 