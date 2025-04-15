'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Import OpenLayers components
import 'ol/ol.css';
import './map.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Stroke, Circle, Fill, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { defaults as defaultControls } from 'ol/control';

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
export default function OpenLayersMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker,
}: OpenLayersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupOverlay = useRef<Overlay | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create map instance
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      controls: defaultControls({
        zoom: true,
        rotate: false,
        attribution: false,
      }),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // Create popup overlay
    if (popupRef.current) {
      popupOverlay.current = new Overlay({
        element: popupRef.current,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10],
      });
      mapInstance.current.addOverlay(popupOverlay.current);
    }

    // Add click handler
    mapInstance.current.on('click', evt => {
      const map = mapInstance.current;
      if (!map) return;

      const feature = map.forEachFeatureAtPixel(evt.pixel, feature => feature);

      if (feature && feature.get('type') === 'marker') {
        const index = feature.get('index');
        onMarkerClick(index);
      }
    });

    setIsLoading(false);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [onMarkerClick]);

  // Update map when data changes
  useEffect(() => {
    if (!mapInstance.current || !gpxData || forecastPoints.length === 0) return;

    const map = mapInstance.current;

    // Clear existing layers
    map
      .getLayers()
      .getArray()
      .filter(layer => layer instanceof VectorLayer)
      .forEach(layer => map.removeLayer(layer));

    // Create route layer
    const routeSource = new VectorSource();
    const routeLayer = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({
          color: '#3b82f6',
          width: 4,
        }),
      }),
    });

    // Create markers layer
    const markersSource = new VectorSource();
    const markersLayer = new VectorLayer({
      source: markersSource,
      style: feature => {
        const index = feature.get('index');
        const isSelected = index === selectedMarker;

        return new Style({
          image: new Circle({
            radius: isSelected ? 10 : 8,
            fill: new Fill({
              color: isSelected ? '#3b82f6' : '#64748b',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2,
            }),
          }),
          text: new Text({
            text: `${index + 1}`,
            fill: new Fill({
              color: '#ffffff',
            }),
            font: 'bold 12px sans-serif',
            offsetY: 1,
          }),
        });
      },
    });

    // Add route line
    if (gpxData.points.length > 0) {
      const routeCoords = gpxData.points.map(point => fromLonLat([point.lon, point.lat]));

      const routeFeature = new Feature({
        geometry: new LineString(routeCoords),
      });

      routeSource.addFeature(routeFeature);
    }

    // Add markers for forecast points
    forecastPoints.forEach((point, index) => {
      const markerFeature = new Feature({
        geometry: new Point(fromLonLat([point.lon, point.lat])),
        type: 'marker',
        index: index,
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
      maxZoom: 16,
    });
  }, [gpxData, forecastPoints, selectedMarker]);

  // Update popup when selected marker changes
  useEffect(() => {
    if (!mapInstance.current || !popupOverlay.current || selectedMarker === null) return;

    if (selectedMarker !== null && forecastPoints[selectedMarker]) {
      const coords = fromLonLat([
        forecastPoints[selectedMarker].lon,
        forecastPoints[selectedMarker].lat,
      ]);
      popupOverlay.current.setPosition(coords);
    } else {
      popupOverlay.current.setPosition(undefined);
    }
  }, [selectedMarker, forecastPoints]);

  if (isLoading) {
    return (
      <div className="h-full w-full bg-muted/20 flex items-center justify-center">
        <LoadingSpinner message="Initializing map..." centered variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Map container */}
      <div className="h-full w-full" ref={mapRef}></div>

      {/* Popup overlay */}
      <div
        ref={popupRef}
        className={`map-popup ${selectedMarker !== null ? 'opacity-100' : 'opacity-0'}`}
      >
        {selectedMarker !== null && weatherData[selectedMarker] && (
          <div className="text-center whitespace-nowrap">
            <div className="font-medium">
              {weatherData[selectedMarker]?.temperature.toFixed(1)}°C
            </div>
            <div className="text-xs text-muted-foreground">
              {weatherData[selectedMarker]?.windSpeed.toFixed(1)} km/h
            </div>
          </div>
        )}
      </div>

      {/* Weather info panel */}
      {selectedMarker !== null && weatherData[selectedMarker] && (
        <div className="map-info-panel">
          <div className="font-medium mb-1">
            Point {selectedMarker + 1} of {forecastPoints.length}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>Temperature:</div>
            <div className="font-medium">
              {weatherData[selectedMarker]?.temperature.toFixed(1)}°C
            </div>

            <div>Feels Like:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.feelsLike.toFixed(1)}°C</div>

            <div>Wind:</div>
            <div className="font-medium">
              {weatherData[selectedMarker]?.windSpeed.toFixed(1)} km/h
            </div>

            <div>Precipitation:</div>
            <div className="font-medium">
              {weatherData[selectedMarker]?.precipitation.toFixed(1)} mm
            </div>

            <div>Humidity:</div>
            <div className="font-medium">{weatherData[selectedMarker]?.humidity}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
