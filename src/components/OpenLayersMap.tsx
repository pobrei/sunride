'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GPXData } from '@/utils/gpxParser';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatDistance, formatDateTime, formatTemperature, getMarkerColor } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';

// OpenLayers imports
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { LineString, Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Stroke, Circle, Fill, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { defaults as defaultControls } from 'ol/control';
import { pointerMove } from 'ol/events/condition';
import Select from 'ol/interaction/Select';

interface OpenLayersMapProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
}

const OpenLayersMap: React.FC<OpenLayersMapProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupOverlayRef = useRef<Overlay | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

  // Check if we have valid data
  const hasValidData = 
    gpxData && 
    gpxData.points && 
    gpxData.points.length > 0 && 
    forecastPoints && 
    forecastPoints.length > 0 && 
    weatherData && 
    weatherData.length > 0;

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !hasValidData || mapInstanceRef.current) return;

    try {
      // Create popup overlay
      popupOverlayRef.current = new Overlay({
        element: popupRef.current!,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
      });

      // Create route feature
      const routeCoords = gpxData!.points.map(point => 
        fromLonLat([point.lon, point.lat])
      );
      
      const routeFeature = new Feature({
        geometry: new LineString(routeCoords),
        name: 'Route'
      });
      
      routeFeature.setStyle(new Style({
        stroke: new Stroke({
          color: '#3b82f6',
          width: 4
        })
      }));
      
      // Create marker features
      const markerFeatures = forecastPoints.map((point, index) => {
        if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number') return null;
        
        const weather = weatherData[index];
        if (!weather) return null;
        
        const markerFeature = new Feature({
          geometry: new Point(fromLonLat([point.lon, point.lat])),
          id: index,
          point: point,
          weather: weather
        });
        
        const isSelected = selectedMarker === index;
        const markerColor = getMarkerColor(weather);
        
        markerFeature.setStyle(new Style({
          image: new Circle({
            radius: isSelected ? 10 : 8,
            fill: new Fill({
              color: isSelected ? '#3b82f6' : markerColor
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2
            })
          }),
          text: new Text({
            text: (index + 1).toString(),
            fill: new Fill({
              color: '#ffffff'
            }),
            font: 'bold 12px sans-serif',
            offsetY: 1
          })
        }));
        
        return markerFeature;
      }).filter(Boolean) as Feature[];
      
      // Create vector source and layer
      const vectorSource = new VectorSource({
        features: [routeFeature, ...markerFeatures]
      });
      
      const vectorLayer = new VectorLayer({
        source: vectorSource
      });
      
      // Create map
      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer
        ],
        controls: defaultControls({
          zoom: true,
          rotate: false,
          attribution: true
        }),
        overlays: [popupOverlayRef.current],
        view: new View({
          center: fromLonLat([
            gpxData!.points[0].lon, 
            gpxData!.points[0].lat
          ]),
          zoom: 12
        })
      });
      
      // Add hover interaction
      const hoverInteraction = new Select({
        condition: pointerMove,
        style: (feature) => {
          const id = feature.get('id');
          if (id === undefined) return undefined; // Not a marker
          
          const weather = feature.get('weather');
          const markerColor = getMarkerColor(weather);
          
          return new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({
                color: selectedMarker === id ? '#3b82f6' : markerColor
              }),
              stroke: new Stroke({
                color: '#ffffff',
                width: 3
              })
            }),
            text: new Text({
              text: (id + 1).toString(),
              fill: new Fill({
                color: '#ffffff'
              }),
              font: 'bold 12px sans-serif',
              offsetY: 1
            })
          });
        }
      });
      
      mapInstanceRef.current.addInteraction(hoverInteraction);
      
      // Add hover handler
      hoverInteraction.on('select', (e) => {
        if (e.selected.length > 0) {
          const feature = e.selected[0];
          const id = feature.get('id');
          if (id !== undefined) {
            setHoveredMarker(id);
            
            // Show popup
            const point = feature.get('point');
            const weather = feature.get('weather');
            
            if (point && weather && popupOverlayRef.current) {
              const coordinate = (feature.getGeometry() as Point).getCoordinates();
              
              // Update popup content
              if (popupRef.current) {
                popupRef.current.innerHTML = `
                  <div class="font-medium">${formatDateTime(point.timestamp)}</div>
                  <div>${formatTemperature(weather.temperature)}</div>
                `;
              }
              
              popupOverlayRef.current.setPosition(coordinate);
            }
          }
        } else {
          setHoveredMarker(null);
          
          // Hide popup
          if (popupOverlayRef.current) {
            popupOverlayRef.current.setPosition(undefined);
          }
        }
      });
      
      // Add click handler
      mapInstanceRef.current.on('click', (event) => {
        const feature = mapInstanceRef.current!.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature
        );
        
        if (feature && feature.get('id') !== undefined) {
          onMarkerClick(feature.get('id'));
        }
      });
      
      // Update marker styles when selectedMarker changes
      if (selectedMarker !== null) {
        const features = vectorSource.getFeatures();
        features.forEach(feature => {
          const id = feature.get('id');
          if (id === undefined) return; // Not a marker
          
          const isSelected = selectedMarker === id;
          const weather = feature.get('weather');
          const markerColor = getMarkerColor(weather);
          
          feature.setStyle(new Style({
            image: new Circle({
              radius: isSelected ? 10 : 8,
              fill: new Fill({
                color: isSelected ? '#3b82f6' : markerColor
              }),
              stroke: new Stroke({
                color: '#ffffff',
                width: 2
              })
            }),
            text: new Text({
              text: (id + 1).toString(),
              fill: new Fill({
                color: '#ffffff'
              }),
              font: 'bold 12px sans-serif',
              offsetY: 1
            })
          }));
        });
      }
      
      // Fit map to route
      const routeExtent = routeFeature.getGeometry()!.getExtent();
      mapInstanceRef.current.getView().fit(routeExtent, {
        padding: [50, 50, 50, 50],
        maxZoom: 15
      });
    } catch (error) {
      console.error('Error initializing OpenLayers map:', error);
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [gpxData, hasValidData]);
  
  // Update marker styles when selectedMarker changes
  useEffect(() => {
    if (!mapInstanceRef.current || selectedMarker === null) return;
    
    try {
      const vectorLayer = mapInstanceRef.current.getLayers().getArray()[1] as VectorLayer<VectorSource>;
      const vectorSource = vectorLayer.getSource()!;
      
      const features = vectorSource.getFeatures();
      features.forEach(feature => {
        const id = feature.get('id');
        if (id === undefined) return; // Not a marker
        
        const isSelected = selectedMarker === id;
        const weather = feature.get('weather');
        const markerColor = getMarkerColor(weather);
        
        feature.setStyle(new Style({
          image: new Circle({
            radius: isSelected ? 10 : 8,
            fill: new Fill({
              color: isSelected ? '#3b82f6' : markerColor
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2
            })
          }),
          text: new Text({
            text: (id + 1).toString(),
            fill: new Fill({
              color: '#ffffff'
            }),
            font: 'bold 12px sans-serif',
            offsetY: 1
          })
        }));
      });
      
      // Center map on selected marker
      const selectedFeature = features.find(feature => feature.get('id') === selectedMarker);
      if (selectedFeature) {
        const geometry = selectedFeature.getGeometry() as Point;
        const coordinate = geometry.getCoordinates();
        
        mapInstanceRef.current.getView().animate({
          center: coordinate,
          duration: 500
        });
      }
    } catch (error) {
      console.error('Error updating marker styles:', error);
    }
  }, [selectedMarker]);
  
  // If no valid data, show a fallback UI
  if (!hasValidData) {
    return (
      <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth">
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="p-6 rounded-xl bg-card shadow-lg text-center">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Map Unavailable</h3>
            <p className="text-muted-foreground mb-4">
              The map is currently unavailable because no route data is loaded.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Please upload a GPX file to view your route on the map.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Popup overlay */}
      <div 
        ref={popupRef} 
        className="absolute bg-white px-3 py-2 rounded-md shadow-md text-sm pointer-events-none transform -translate-x-1/2 hidden"
      />
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button 
          size="sm" 
          variant="secondary"
          className="bg-white/90 hover:bg-white"
          onClick={() => {
            if (mapInstanceRef.current && gpxData) {
              const vectorLayer = mapInstanceRef.current.getLayers().getArray()[1] as VectorLayer<VectorSource>;
              const vectorSource = vectorLayer.getSource()!;
              const routeFeature = vectorSource.getFeatures().find(feature => feature.get('name') === 'Route');
              
              if (routeFeature) {
                const routeExtent = routeFeature.getGeometry()!.getExtent();
                mapInstanceRef.current.getView().fit(routeExtent, {
                  padding: [50, 50, 50, 50],
                  maxZoom: 15,
                  duration: 1000
                });
              }
            }
          }}
        >
          <Navigation className="h-4 w-4 mr-1" />
          Fit Route
        </Button>
      </div>
      
      {/* Attribution */}
      <div className="absolute bottom-0 left-0 right-0 p-1 bg-white/80 text-center text-xs text-muted-foreground">
        Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors
      </div>
    </div>
  );
};

export default OpenLayersMap;
