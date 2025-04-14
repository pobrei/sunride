'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface OpenLayersMapProps {
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
 * A map component that uses OpenLayers to display the route and weather data
 */
export default function OpenLayersMapFixed({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker
}: OpenLayersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInitialized) return;
    
    const initMap = async () => {
      try {
        // Dynamically import OpenLayers modules
        const ol = await import('ol');
        const Map = (await import('ol/Map')).default;
        const View = (await import('ol/View')).default;
        const TileLayer = (await import('ol/layer/Tile')).default;
        const OSM = (await import('ol/source/OSM')).default;
        const { fromLonLat } = await import('ol/proj');
        
        // Import CSS
        await import('ol/ol.css');
        
        // Create map
        const map = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM()
            })
          ],
          view: new View({
            center: fromLonLat([0, 0]),
            zoom: 2
          })
        });
        
        // Store map in window for debugging
        (window as any).olMap = map;
        
        setMapInitialized(true);
        setIsLoading(false);
        
        // Update map with data if available
        if (gpxData && forecastPoints.length > 0) {
          updateMap();
        }
      } catch (err) {
        console.error('Error initializing OpenLayers map:', err);
        setError('Failed to initialize map. Please try again later.');
        setIsLoading(false);
      }
    };
    
    initMap();
  }, [mapInitialized, gpxData, forecastPoints.length]);
  
  // Update map when data changes
  useEffect(() => {
    if (!mapInitialized || !gpxData || forecastPoints.length === 0) return;
    
    const updateMap = async () => {
      try {
        // Get OpenLayers modules
        const ol = await import('ol');
        const { fromLonLat } = await import('ol/proj');
        const VectorSource = (await import('ol/source/Vector')).default;
        const VectorLayer = (await import('ol/layer/Vector')).default;
        const Feature = (await import('ol/Feature')).default;
        const Point = (await import('ol/geom/Point')).default;
        const LineString = (await import('ol/geom/LineString')).default;
        const { Style, Fill, Stroke, Circle, Text } = await import('ol/style');
        
        const map = (window as any).olMap;
        if (!map) return;
        
        // Remove existing vector layers
        map.getLayers().getArray()
          .filter((layer: any) => layer instanceof VectorLayer)
          .forEach((layer: any) => map.removeLayer(layer));
        
        // Create route layer
        const routeSource = new VectorSource();
        const routeLayer = new VectorLayer({
          source: routeSource,
          style: new Style({
            stroke: new Stroke({
              color: '#3b82f6',
              width: 4
            })
          })
        });
        
        // Create markers layer
        const markersSource = new VectorSource();
        const markersLayer = new VectorLayer({
          source: markersSource,
          style: (feature) => {
            const index = feature.get('index');
            const isSelected = index === selectedMarker;
            
            return new Style({
              image: new Circle({
                radius: isSelected ? 10 : 8,
                fill: new Fill({
                  color: isSelected ? '#3b82f6' : '#64748b'
                }),
                stroke: new Stroke({
                  color: '#ffffff',
                  width: 2
                })
              }),
              text: new Text({
                text: `${index + 1}`,
                fill: new Fill({
                  color: '#ffffff'
                }),
                font: 'bold 12px sans-serif',
                offsetY: 1
              })
            });
          }
        });
        
        // Add route line
        if (gpxData.points.length > 0) {
          const routeCoords = gpxData.points.map(point => 
            fromLonLat([point.lon, point.lat])
          );
          
          const routeFeature = new Feature({
            geometry: new LineString(routeCoords)
          });
          
          routeSource.addFeature(routeFeature);
        }
        
        // Add markers for forecast points
        forecastPoints.forEach((point, index) => {
          const markerFeature = new Feature({
            geometry: new Point(fromLonLat([point.lon, point.lat])),
            type: 'marker',
            index: index
          });
          
          markersSource.addFeature(markerFeature);
        });
        
        // Add layers to map
        map.addLayer(routeLayer);
        map.addLayer(markersLayer);
        
        // Fit map to route extent
        const extent = routeSource.getExtent();
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 16
        });
        
        // Add click handler
        map.on('click', (evt: any) => {
          const feature = map.forEachFeatureAtPixel(evt.pixel, (feature: any) => feature);
          
          if (feature && feature.get('type') === 'marker') {
            const index = feature.get('index');
            onMarkerClick(index);
          }
        });
      } catch (err) {
        console.error('Error updating map:', err);
        setError('Failed to update map with route data.');
      }
    };
    
    updateMap();
  }, [mapInitialized, gpxData, forecastPoints, weatherData, selectedMarker, onMarkerClick]);
  
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
  
  if (error) {
    return (
      <div className="h-full w-full bg-muted/20 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">⚠️ {error}</div>
          <p className="text-sm text-muted-foreground">
            Using fallback map display instead.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full relative">
      {/* Map container */}
      <div className="h-full w-full" ref={mapRef}></div>
      
      {/* Weather info panel */}
      {selectedMarker !== null && weatherData[selectedMarker] && (
        <div className="absolute bottom-2 left-2 right-2 md:left-auto md:right-2 md:w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-md shadow-md border border-slate-200 dark:border-slate-700 text-sm">
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
      
      {/* Custom styles for OpenLayers */}
      <style jsx global>{`
        /* Dark mode support */
        .dark .ol-control button {
          background-color: #1e293b;
          color: white;
        }
        
        .dark .ol-control button:hover,
        .dark .ol-control button:focus {
          background-color: #334155;
        }
        
        .dark .ol-attribution {
          background: rgba(15, 23, 42, 0.8);
          color: #cbd5e1;
        }
        
        .dark .ol-attribution a {
          color: #93c5fd;
        }
      `}</style>
    </div>
  );
}
