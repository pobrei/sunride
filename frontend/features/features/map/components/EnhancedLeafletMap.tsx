'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GPXData } from '@frontend/features/gpx/types';
import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';
// Note: leaflet.heat is imported dynamically in the HeatmapLayer component
import {
  formatDistance,
  formatDateTime,
  formatTemperature,
  formatWind,
  formatPrecipitation,
  getWeatherIconUrl,
  getMarkerColor,
} from '@shared/utils/formatUtils';
import { Button } from '@frontend/components/ui/button';
import { LoadingSpinner } from '@frontend/components/ui/LoadingSpinner';
import { Crosshair, Layers, Thermometer, Wind, TrendingUp, Droplets, Sun, Mountain, Play, Pause, SkipForward, SkipBack, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';
import { KeyboardNavigation } from '@frontend/features/navigation/components';

// Types for the map props
interface EnhancedLeafletMapProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
}

// Create a client-only map wrapper that will only load on the client
const MapContent = ({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker,
}: EnhancedLeafletMapProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // Define types for dynamically loaded libraries
  type LeafletType = typeof import('leaflet');
  type ReactLeafletType = typeof import('react-leaflet');

  const [reactLeafletComponents, setReactLeafletComponents] = useState<ReactLeafletType | null>(
    null
  );
  const [leaflet, setLeaflet] = useState<LeafletType | null>(null);

  // Layer visibility state
  const [visibleLayers, setVisibleLayers] = useState({
    temperature: true,
    wind: false,
    elevation: false,
    precipitation: false,
    uv: false,
    heatmap: false,
    routeSegment: false,
    terrain: false,
    animation: false,
  });

  // Selected route segment
  const [routeSegment, setRouteSegment] = useState<{
    start: number | null;
    end: number | null;
  }>({ start: null, end: null });

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms between frames
  const [animationFrame, setAnimationFrame] = useState(0);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle layer visibility
  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    // If toggling animation layer, handle special case
    if (layer === 'animation') {
      const newValue = !visibleLayers.animation;
      setVisibleLayers(prev => ({
        ...prev,
        animation: newValue,
      }));

      // Stop animation if turning off
      if (!newValue && isAnimating) {
        stopAnimation();
      }
      return;
    }

    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  // Animation controls
  const startAnimation = useCallback(() => {
    if (!forecastPoints.length) return;

    setIsAnimating(true);

    // Clear any existing timer
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }

    // Start a new timer
    animationTimerRef.current = setInterval(() => {
      setAnimationFrame(prev => {
        const next = prev + 1;
        return next >= forecastPoints.length ? 0 : next;
      });
    }, animationSpeed);
  }, [forecastPoints.length, animationSpeed]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);

    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  const nextFrame = useCallback(() => {
    if (!forecastPoints.length) return;

    setAnimationFrame(prev => {
      const next = prev + 1;
      return next >= forecastPoints.length ? 0 : next;
    });
  }, [forecastPoints.length]);

  const prevFrame = useCallback(() => {
    if (!forecastPoints.length) return;

    setAnimationFrame(prev => {
      const next = prev - 1;
      return next < 0 ? forecastPoints.length - 1 : next;
    });
  }, [forecastPoints.length]);

  const changeAnimationSpeed = useCallback((faster: boolean) => {
    setAnimationSpeed(prev => {
      const newSpeed = faster ? prev * 0.75 : prev * 1.5;
      // Clamp between 100ms and 5000ms
      return Math.min(Math.max(newSpeed, 100), 5000);
    });

    // Restart animation with new speed if currently animating
    if (isAnimating) {
      stopAnimation();
      startAnimation();
    }
  }, [isAnimating, startAnimation, stopAnimation]);

  // Update selected marker when animation frame changes
  useEffect(() => {
    if (visibleLayers.animation && forecastPoints.length > 0) {
      onMarkerClick(animationFrame);
    }
  }, [animationFrame, forecastPoints.length, onMarkerClick, visibleLayers.animation]);

  // Clean up animation timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, []);

  // Load Leaflet and React-Leaflet libraries
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const [leafletModule, reactLeafletModule] = await Promise.all([
          import('leaflet'),
          import('react-leaflet'),
        ]);

        setLeaflet(leafletModule);
        setReactLeafletComponents(reactLeafletModule);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load map libraries:', error);
      }
    };

    loadLibraries();
  }, []);

  // Validate data
  const validGpxData = gpxData && gpxData.points && gpxData.points.length > 0 ? gpxData : null;
  const hasValidData = Boolean(validGpxData && forecastPoints.length > 0);

  // Show loading state
  if (isLoading || !reactLeafletComponents || !leaflet) {
    return (
      <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card">
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner message="Loading map..." />
        </div>
      </div>
    );
  }

  // Show placeholder if no data
  if (!hasValidData) {
    return (
      <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-2">No route data available</p>
            <p className="text-sm text-muted-foreground">
              Upload a GPX file to see your route on the map
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Once libraries are loaded and data is available, render the map
  const { MapContainer, TileLayer, Polyline, LayerGroup, Marker, Popup, Tooltip, useMap } =
    reactLeafletComponents;
  const L = leaflet;

  // Create route path - without useMemo to avoid hooks order issues
  const routePath = validGpxData?.points?.map(point => [point.lat, point.lon] as [number, number]) || [];

  // Ensure route path is valid
  const hasValidRoutePath = routePath.length > 0 &&
    routePath.every(point => Array.isArray(point) && point.length === 2 &&
    typeof point[0] === 'number' && typeof point[1] === 'number');

  // Debug log to check route data
  console.log('Route path data:', {
    validGpxData: !!validGpxData,
    pointsCount: validGpxData?.points?.length || 0,
    routePathLength: routePath.length,
    samplePoint: routePath.length > 0 ? routePath[0] : null,
    visibleLayers
  });

  // Find bounds of the route - without useMemo to avoid hooks order issues
  const bounds = routePath.length > 0
    ? L.latLngBounds(routePath)
    : L.latLngBounds([
        [0, 0],
        [0, 0],
      ]);

  // Component to center map on bounds
  const MapController = () => {
    const map = useMap();

    // Log route path data for debugging
    console.log('MapController - Route path:', {
      routePathLength: routePath.length,
      samplePoint: routePath.length > 0 ? routePath[0] : null,
      bounds: bounds.isValid() ? bounds.toBBoxString() : 'invalid'
    });

    useEffect(() => {
      if (!map) {
        console.warn('Map not available');
        return;
      }

      // Force a map invalidation immediately to ensure proper rendering
      map.invalidateSize();

      if (bounds.isValid() && hasValidRoutePath) {
        console.log('Fitting map to bounds:', bounds.toBBoxString());
        map.fitBounds(bounds, { padding: [50, 50] });

        // Force another map invalidation after a short delay
        setTimeout(() => {
          map.invalidateSize();
          console.log('Map invalidated for proper rendering');
        }, 500);
      } else {
        console.warn('Bounds not valid or route path invalid');
        // If bounds are not valid but we have route points, try to center on the first point
        if (hasValidRoutePath) {
          const firstPoint = routePath[0] as [number, number];
          console.log('Centering map on first point:', firstPoint);
          map.setView(firstPoint, 13);
        } else {
          // Default view if no valid route
          console.log('Setting default map view');
          map.setView([40, 0], 5); // Default view of the world
        }
      }
    }, [map]); // bounds is in outer scope

    return null;
  };

  // Component to create markers for forecast points
  const MapMarkers = () => {
    // We need to call useMap() even if we don't use it directly
    // This ensures the component is a child of MapContainer
    useMap();

    // Create custom icon for markers
    const createCustomIcon = (weather: WeatherData | null, isSelected: boolean) => {
      const color = getMarkerColor(weather);
      const iconSize = isSelected ? 36 : 30;

      return L.divIcon({
        className: 'custom-marker-icon',
        html: `
          <div style="
            background-color: ${color};
            width: ${iconSize}px;
            height: ${iconSize}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${weather ? `<img src="${getWeatherIconUrl(weather.weatherIcon)}" width="20" height="20" alt="${weather.weatherDescription}" />` : ''}
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      });
    };

    return (
      <LayerGroup>
        {forecastPoints.map((point, index) => {
          const weather = weatherData[index];
          const isSelected = selectedMarker === index;

          return (
            <Marker
              key={`marker-${index}`}
              position={[point.lat, point.lon]}
              icon={createCustomIcon(weather, isSelected)}
              eventHandlers={{
                click: () => onMarkerClick(index),
              }}
            >
              <Tooltip direction="top" offset={[0, -15]} opacity={0.9} permanent={isSelected}>
                {weather ? (
                  <div className="text-xs">
                    <div className="font-semibold">{formatDateTime(point.timestamp)}</div>
                    <div>{formatTemperature(weather.temperature)}</div>
                    {visibleLayers.wind && <div>{formatWind(weather.windSpeed, weather.windDirection)}</div>}
                    {weather.rain > 0 && <div>{formatPrecipitation(weather.rain)}</div>}
                  </div>
                ) : (
                  <div className="text-xs">No weather data</div>
                )}
              </Tooltip>
            </Marker>
          );
        })}
      </LayerGroup>
    );
  };

  // Component to create a button to center the map on the route
  const CenterMapButton = () => {
    const map = useMap();

    return (
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control leaflet-bar">
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 bg-white text-black"
            onClick={() => {
              if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
              }
            }}
            title="Center map on route"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Component to handle keyboard navigation
  const MapKeyboardNavigation = () => {
    const map = useMap();

    const handleNavigate = useCallback(
      (direction: 'up' | 'down' | 'left' | 'right') => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const offset = 100 * Math.pow(2, -zoom);

        let newLat = center.lat;
        let newLng = center.lng;

        switch (direction) {
          case 'up':
            newLat += offset;
            break;
          case 'down':
            newLat -= offset;
            break;
          case 'left':
            newLng -= offset;
            break;
          case 'right':
            newLng += offset;
            break;
        }

        map.panTo([newLat, newLng]);
      },
      [map]
    );

    const handleZoom = useCallback(
      (direction: 'in' | 'out') => {
        const zoom = map.getZoom();
        const newZoom = direction === 'in' ? zoom + 1 : zoom - 1;
        map.setZoom(newZoom);
      },
      [map]
    );

    return (
      <KeyboardNavigation
        onNavigate={handleNavigate}
        onZoom={handleZoom}
        onSelectMarker={index => {
          if (index !== null) {
            onMarkerClick(index);
          }
        }}
        markerCount={forecastPoints.length}
      />
    );
  };

  // Create a gradient for the route line based on elevation
  const getElevationGradient = () => {
    if (!validGpxData || !validGpxData.points.length) return null;

    const points = validGpxData.points;
    const minElevation = validGpxData.minElevation;
    const maxElevation = validGpxData.maxElevation;
    const range = maxElevation - minElevation;

    // If there's no elevation change, return a solid color
    if (range === 0) return null;

    // Create segments for the route with different colors based on elevation
    const segments = [];

    for (let i = 0; i < points.length - 1; i++) {
      const startPoint = points[i];
      const endPoint = points[i + 1];

      // Normalize elevation to 0-1 range
      const normalizedElevation = (startPoint.elevation - minElevation) / range;

      // Create a color based on elevation (blue for low, green for middle, red for high)
      const color = getElevationColor(normalizedElevation);

      segments.push({
        positions: [
          [startPoint.lat, startPoint.lon],
          [endPoint.lat, endPoint.lon]
        ] as [number, number][],
        color,
        index: i
      });
    }

    return segments;
  };

  // Helper function to get color based on normalized elevation (0-1)
  const getElevationColor = (normalizedElevation: number) => {
    // Blue (low) to green (middle) to red (high)
    if (normalizedElevation < 0.33) {
      // Blue to green
      const ratio = normalizedElevation / 0.33;
      return `rgb(${Math.round(ratio * 255)}, ${Math.round(100 + ratio * 155)}, ${Math.round(255 - ratio * 255)})`;
    } else if (normalizedElevation < 0.66) {
      // Green to yellow
      const ratio = (normalizedElevation - 0.33) / 0.33;
      return `rgb(${Math.round(100 + ratio * 155)}, ${Math.round(255)}, ${Math.round(ratio * 100)})`;
    } else {
      // Yellow to red
      const ratio = (normalizedElevation - 0.66) / 0.34;
      return `rgb(${Math.round(255)}, ${Math.round(255 - ratio * 255)}, 0)`;
    }
  };

  // Create temperature heatmap data
  const getTemperatureHeatmapData = () => {
    if (!weatherData || !forecastPoints || forecastPoints.length === 0) return [];

    // Find min and max temperatures for normalization
    const temperatures = weatherData
      .filter(w => w !== null)
      .map(w => w!.temperature);

    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const tempRange = maxTemp - minTemp;

    // Create heatmap points
    return forecastPoints.map((point, index) => {
      const weather = weatherData[index];
      if (!weather) return null;

      // Normalize temperature to 0-1 range
      const normalizedTemp = (weather.temperature - minTemp) / tempRange;

      // Create a color based on temperature (blue for cold, red for hot)
      const color = getTemperatureColor(normalizedTemp);
      const radius = 200 + normalizedTemp * 300; // Size based on temperature

      return {
        lat: point.lat,
        lng: point.lon,
        intensity: normalizedTemp,
        radius,
        color
      };
    }).filter(Boolean);
  };

  // Helper function to get color based on normalized temperature (0-1)
  const getTemperatureColor = (normalizedTemp: number) => {
    // Blue (cold) to red (hot)
    if (normalizedTemp < 0.5) {
      // Blue to yellow
      const ratio = normalizedTemp * 2;
      return `rgb(${Math.round(ratio * 255)}, ${Math.round(ratio * 255)}, ${Math.round(255 - ratio * 255)})`;
    } else {
      // Yellow to red
      const ratio = (normalizedTemp - 0.5) * 2;
      return `rgb(255, ${Math.round(255 - ratio * 255)}, 0)`;
    }
  };

  // Handle route segment selection
  const handleRouteSegmentSelection = (index: number) => {
    if (!validGpxData) return;

    setRouteSegment(prev => {
      // If start is not set, set it
      if (prev.start === null) {
        return { start: index, end: null };
      }

      // If start is set but end is not, set end
      if (prev.end === null) {
        // Ensure start is always less than end
        const start = Math.min(prev.start, index);
        const end = Math.max(prev.start, index);
        return { start, end };
      }

      // If both are set, reset and set new start
      return { start: index, end: null };
    });

    // Enable route segment layer if not already enabled
    if (!visibleLayers.routeSegment) {
      setVisibleLayers(prev => ({
        ...prev,
        routeSegment: true
      }));
    }
  };

  // Calculate route segment statistics
  const calculateRouteSegmentStats = () => {
    if (!validGpxData || routeSegment.start === null || routeSegment.end === null) {
      return null;
    }

    const { start, end } = routeSegment;
    const points = validGpxData.points.slice(start, end + 1);

    if (points.length < 2) return null;

    // Calculate segment distance
    const segmentDistance = points[points.length - 1].distance - points[0].distance;

    // Calculate elevation gain and loss
    let elevationGain = 0;
    let elevationLoss = 0;

    for (let i = 1; i < points.length; i++) {
      const elevationDiff = points[i].elevation - points[i - 1].elevation;
      if (elevationDiff > 0) {
        elevationGain += elevationDiff;
      } else {
        elevationLoss += Math.abs(elevationDiff);
      }
    }

    // Calculate min and max elevation
    const elevations = points.map(p => p.elevation);
    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);

    return {
      distance: segmentDistance,
      elevationGain,
      elevationLoss,
      minElevation,
      maxElevation,
      startPoint: points[0],
      endPoint: points[points.length - 1],
      pointCount: points.length
    };
  };

  const routeSegmentStats = calculateRouteSegmentStats();

  // Get elevation gradient segments
  const elevationSegments = getElevationGradient();

  // Debug log for elevation segments
  console.log('Elevation segments:', {
    hasElevationSegments: !!elevationSegments,
    segmentsCount: elevationSegments?.length || 0,
    sampleSegment: elevationSegments && elevationSegments.length > 0 ? elevationSegments[0] : null
  });

  // Get temperature heatmap data
  const getHeatmapData = () => {
    return visibleLayers.heatmap ? getTemperatureHeatmapData() : [];
  };

  const temperatureHeatmapData = getHeatmapData();

  // Create a HeatmapLayer component
  const HeatmapLayer = () => {
    const map = useMap();
    const [fallbackLayerActive, setFallbackLayerActive] = useState(false);

    useEffect(() => {
      if (!map || !temperatureHeatmapData.length) {
        console.log('Skipping heatmap layer - no map or data');
        return;
      }

      console.log('Setting up heatmap layer with', temperatureHeatmapData.length, 'points');

      // Create a reference to store the layer
      let heatLayerRef: L.Layer | null = null;
      let fallbackLayersRef: L.Layer[] = [];

      // Fallback function to create simple circles instead of heatmap
      const createFallbackLayer = () => {
        console.log('Creating fallback visualization for heatmap');
        setFallbackLayerActive(true);

        // Filter out null values
        const validPoints = temperatureHeatmapData.filter(point => point !== null);

        // Create a circle for each point
        const layers = validPoints.map(point => {
          const circle = L.circle(
            [point!.lat, point!.lng],
            {
              radius: 200,
              color: point!.color,
              fillColor: point!.color,
              fillOpacity: 0.5,
              weight: 1
            }
          ).addTo(map);

          return circle;
        });

        return layers;
      };

      // Dynamically import leaflet.heat
      const loadHeatLayer = async () => {
        try {
          // Check if L.heatLayer is already available
          // @ts-expect-error - HeatLayer is not in the types
          if (typeof L.heatLayer !== 'function') {
            try {
              // Import the leaflet.heat module
              const heatModule = await import('leaflet.heat');
              console.log('Leaflet.heat module loaded:', heatModule);

              // Check again if L.heatLayer is available after import
              // @ts-expect-error - HeatLayer is not in the types
              if (typeof L.heatLayer !== 'function') {
                console.error('L.heatLayer is not available even after import');
                throw new Error('L.heatLayer is not available');
              }
            } catch (importError) {
              console.error('Failed to import leaflet.heat:', importError);
              throw importError;
            }
          }

          // Filter out null values and prepare data for heatmap
          const heatData = temperatureHeatmapData
            .filter(point => point !== null)
            .map(point => [
              point!.lat,
              point!.lng,
              point!.intensity
            ]);

          // Now we can use L.heatLayer
          // @ts-expect-error - HeatLayer is not in the types
          const heatLayer = L.heatLayer(
            heatData,
            {
              radius: 25,
              blur: 15,
              maxZoom: 17,
              gradient: {
                0.0: 'blue',
                0.5: 'lime',
                0.8: 'yellow',
                1.0: 'red'
              }
            }
          );

          // Add the layer to the map
          heatLayer.addTo(map);
          console.log('Heatmap layer added to map');
          return heatLayer;
        } catch (error) {
          console.error('Failed to load heatmap layer:', error);

          // Create fallback visualization
          const fallbackLayers = createFallbackLayer();
          fallbackLayersRef = fallbackLayers;

          return null;
        }
      };

      // Load the heat layer
      loadHeatLayer().then(layer => {
        heatLayerRef = layer;
      });

      // Cleanup function
      return () => {
        // Remove heatmap layer if it exists
        if (heatLayerRef) {
          try {
            map.removeLayer(heatLayerRef);
            console.log('Heatmap layer removed');
          } catch (error) {
            console.error('Error removing heatmap layer:', error);
          }
        }

        // Remove fallback layers if they exist
        if (fallbackLayersRef.length > 0) {
          try {
            fallbackLayersRef.forEach(layer => map.removeLayer(layer));
            console.log('Fallback layers removed');
            setFallbackLayerActive(false);
          } catch (error) {
            console.error('Error removing fallback layers:', error);
          }
        }
      };
    }, [map]); // temperatureHeatmapData is in outer scope

    // Show a message when using fallback visualization
    if (fallbackLayerActive) {
      return (
        <div className="absolute bottom-20 right-4 z-20 bg-white bg-opacity-90 p-2 rounded-md shadow-md text-xs">
          <p>Using simplified temperature visualization</p>
        </div>
      );
    }

    return null;
  };

  // Create a RouteSegment component
  const RouteSegment = () => {
    if (!visibleLayers.routeSegment || !routeSegment.start || !routeSegment.end || !validGpxData) {
      return null;
    }

    const { start, end } = routeSegment;
    const segmentPoints = validGpxData.points.slice(start, end + 1);
    const positions = segmentPoints.map(point => [point.lat, point.lon] as [number, number]);

    return (
      <>
        <Polyline
          positions={positions}
          color="#ff3300"
          weight={8}
          opacity={0.8}
        />
        {routeSegmentStats && (
          <Popup className="route-segment-popup">
            <div className="p-2">
              <h3 className="font-bold text-sm mb-2">Route Segment</h3>
              <div className="text-xs space-y-1">
                <p><strong>Distance:</strong> {formatDistance(routeSegmentStats.distance)}</p>
                <p><strong>Elevation Gain:</strong> {Math.round(routeSegmentStats.elevationGain)}m</p>
                <p><strong>Elevation Loss:</strong> {Math.round(routeSegmentStats.elevationLoss)}m</p>
                <p><strong>Min Elevation:</strong> {Math.round(routeSegmentStats.minElevation)}m</p>
                <p><strong>Max Elevation:</strong> {Math.round(routeSegmentStats.maxElevation)}m</p>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Click on route points to select a different segment
              </div>
            </div>
          </Popup>
        )}
      </>
    );
  };

  return (
    <div className="relative h-[500px] w-full rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth">
      <MapContainer
        center={routePath.length > 0 ? routePath[0] : [51.505, -0.09]}
        zoom={13}
        className="z-10 h-full w-full"
      >
        {/* Base map layer */}
        {!visibleLayers.terrain && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        {/* Terrain layer */}
        {visibleLayers.terrain && (
          <TileLayer
            url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            maxZoom={18}
          />
        )}

        {/* Standard route line (when elevation layer is off) */}
        {!visibleLayers.elevation && hasValidRoutePath && (
          <Polyline
            positions={routePath}
            color="hsl(var(--primary))"
            weight={5}
            opacity={0.8}
            eventHandlers={{
              click: (e) => {
                // Find the closest point on the route
                if (!validGpxData) return;

                const clickLatLng = e.latlng;
                let closestPointIndex = 0;
                let minDistance = Infinity;

                validGpxData.points.forEach((point, index) => {
                  const distance = L.latLng(point.lat, point.lon).distanceTo(clickLatLng);
                  if (distance < minDistance) {
                    minDistance = distance;
                    closestPointIndex = index;
                  }
                });

                handleRouteSegmentSelection(closestPointIndex);
              }
            }}
          />
        )}

        {/* Elevation-colored route segments (when elevation layer is on) */}
        {visibleLayers.elevation && hasValidRoutePath && elevationSegments && elevationSegments.length > 0 && elevationSegments.map((segment, index) => (
          <Polyline
            key={`segment-${index}`}
            positions={segment.positions}
            color={segment.color}
            weight={5}
            opacity={0.8}
            eventHandlers={{
              click: () => handleRouteSegmentSelection(segment.index)
            }}
          />
        ))}

        {/* Temperature heatmap layer */}
        {visibleLayers.heatmap && <HeatmapLayer />}

        {/* Route segment selection */}
        <RouteSegment />

        <MapMarkers />
        <MapController />
        <CenterMapButton />
        <MapKeyboardNavigation />
      </MapContainer>

      {/* Layer controls */}
      <div className="absolute top-4 left-4 z-20 bg-white bg-opacity-90 p-2 rounded-md shadow-md">
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant={visibleLayers.temperature ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleLayer('temperature')}
          >
            <Thermometer className="h-4 w-4" />
            <span className="text-xs">Temperature</span>
          </Button>

          <Button
            size="sm"
            variant={visibleLayers.wind ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleLayer('wind')}
          >
            <Wind className="h-4 w-4" />
            <span className="text-xs">Wind</span>
          </Button>

          <Button
            size="sm"
            variant={visibleLayers.elevation ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleLayer('elevation')}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Elevation</span>
          </Button>

          <Button
            size="sm"
            variant={visibleLayers.precipitation ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleLayer('precipitation')}
          >
            <Droplets className="h-4 w-4" />
            <span className="text-xs">Precipitation</span>
          </Button>

          <Button
            size="sm"
            variant={visibleLayers.heatmap ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleLayer('heatmap')}
          >
            <Layers className="h-4 w-4" />
            <span className="text-xs">Temp Heatmap</span>
          </Button>

          <Button
            size="sm"
            variant={visibleLayers.routeSegment ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleLayer('routeSegment')}
          >
            <Sun className="h-4 w-4" />
            <span className="text-xs">Route Segment</span>
          </Button>

          <Button
            size="sm"
            variant={visibleLayers.terrain ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleLayer('terrain')}
          >
            <Mountain className="h-4 w-4" />
            <span className="text-xs">Terrain</span>
          </Button>

          <Button
            size="sm"
            variant={visibleLayers.animation ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleLayer('animation')}
          >
            <Clock className="h-4 w-4" />
            <span className="text-xs">Animation</span>
          </Button>
        </div>
      </div>

      {/* Route segment info panel */}
      {visibleLayers.routeSegment && routeSegmentStats && (
        <div className="absolute bottom-4 left-4 z-20 bg-white bg-opacity-90 p-3 rounded-md shadow-md max-w-xs">
          <h3 className="font-bold text-sm mb-2">Route Segment Analysis</h3>
          <div className="text-xs space-y-1">
            <p><strong>Distance:</strong> {formatDistance(routeSegmentStats.distance)}</p>
            <p><strong>Elevation Gain:</strong> {Math.round(routeSegmentStats.elevationGain)}m</p>
            <p><strong>Elevation Loss:</strong> {Math.round(routeSegmentStats.elevationLoss)}m</p>
            <p><strong>Min Elevation:</strong> {Math.round(routeSegmentStats.minElevation)}m</p>
            <p><strong>Max Elevation:</strong> {Math.round(routeSegmentStats.maxElevation)}m</p>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Click on route points to select a different segment
          </div>
        </div>
      )}

      {/* Weather animation controls */}
      {visibleLayers.animation && (
        <div className="absolute bottom-4 right-4 z-20 bg-white bg-opacity-90 p-3 rounded-md shadow-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Weather Animation</h3>
              <div className="text-xs text-muted-foreground">
                {forecastPoints.length > 0 && animationFrame < forecastPoints.length && (
                  formatDateTime(forecastPoints[animationFrame].timestamp)
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={prevFrame}
                title="Previous frame"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              {isAnimating ? (
                <Button
                  size="icon"
                  variant="default"
                  className="h-8 w-8"
                  onClick={stopAnimation}
                  title="Pause animation"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="default"
                  className="h-8 w-8"
                  onClick={startAnimation}
                  title="Play animation"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}

              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={nextFrame}
                title="Next frame"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => changeAnimationSpeed(false)}
                title="Slower"
              >
                Slower
              </Button>

              <div className="text-xs">
                {(animationSpeed / 1000).toFixed(1)}s
              </div>

              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => changeAnimationSpeed(true)}
                title="Faster"
              >
                Faster
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create a dynamic component with SSR disabled
const EnhancedLeafletMap = dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
}) as React.ComponentType<EnhancedLeafletMapProps>;

export default EnhancedLeafletMap;
