'use client';

/**
 * CenterMapButton Component
 *
 * A button that centers the map on the route.
 * This component follows iOS 19 design principles.
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CenterMapButtonProps {
  /** Optional className for styling */
  className?: string;
  /** Optional size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
  /** Optional variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

/**
 * A button that centers the map on the route
 */
export function CenterMapButton({
  className,
  size = 'icon-sm',
  variant = 'secondary',
}: CenterMapButtonProps) {
  // Function to center the map on the route
  const centerMap = useCallback(() => {
    try {
      console.log('Attempting to center map on route...');

      // Try multiple selectors to find the map container
      const selectors = [
        '.leaflet-container',
        '#map',
        '[class*="leaflet"]',
        '.map-container'
      ];

      let mapElement = null;
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`Found map element with selector: ${selector}`);
          mapElement = element;
          break;
        }
      }

      if (!mapElement) {
        console.error('Map element not found. The map might not be loaded yet.');
        // Try again after a short delay
        setTimeout(centerMap, 500);
        return;
      }

      // Try different ways to access the Leaflet map instance
      let map = null;

      // Method 1: Direct access via _leaflet_map property
      if ((mapElement as any)._leaflet_map) {
        console.log('Found map via _leaflet_map property');
        map = (mapElement as any)._leaflet_map;
      }
      // Method 2: Access via the Leaflet global object
      else if ((window as any).L && (window as any).L.map) {
        console.log('Attempting to find map via Leaflet global object');
        // Try to get the map instance from Leaflet
        const mapId = (mapElement as HTMLElement).id;
        if (mapId && (window as any).L.map(mapId)) {
          map = (window as any).L.map(mapId);
        }
      }
      // Method 3: Look for map instance in all elements
      else {
        console.log('Searching for map instance in DOM elements');
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          if ((el as any)._leaflet_map) {
            map = (el as any)._leaflet_map;
            console.log('Found map instance in element:', el);
            break;
          }
        }
      }

      if (!map) {
        console.error('Leaflet map instance not found. The map might not be initialized yet.');
        // Try again after a short delay
        setTimeout(centerMap, 500);
        return;
      }

      // Find the route layer
      const layers = map._layers;
      if (!layers) {
        console.error('No layers found in map');
        return;
      }

      const layerKeys = Object.keys(layers);
      console.log(`Found ${layerKeys.length} layers in map`);

      // Try to find a layer with getBounds method (likely the route)
      let routeLayer = null;

      // First, look for polyline layers (most likely to be routes)
      for (const key of layerKeys) {
        const layer = layers[key];
        if (layer._latlngs && layer.getBounds && typeof layer.getBounds === 'function') {
          console.log('Found potential route layer (polyline)');
          routeLayer = layer;
          break;
        }
      }

      // If no polyline found, try any layer with getBounds
      if (!routeLayer) {
        for (const key of layerKeys) {
          const layer = layers[key];
          if (layer.getBounds && typeof layer.getBounds === 'function') {
            console.log('Found layer with getBounds');
            routeLayer = layer;
            break;
          }
        }
      }

      // If still no layer found, try to use the map's bounds
      if (!routeLayer && map.getBounds) {
        console.log('No route layer found, using map bounds');
        map.fitBounds(map.getBounds());
        return;
      }

      if (!routeLayer) {
        console.error('Route layer not found');
        return;
      }

      // Center the map on the route bounds
      console.log('Centering map on route bounds');
      map.fitBounds(routeLayer.getBounds(), {
        padding: [50, 50],
        maxZoom: 14,
      });

      console.log('Map centered on route successfully');
    } catch (error) {
      console.error('Error centering map:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  }, []);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "bg-card/80 backdrop-blur-sm shadow-sm",
        className
      )}
      onClick={centerMap}
      aria-label="Center map"
      title="Center map on route"
    >
      <Locate className="h-4 w-4" />
    </Button>
  );
}

/**
 * A standalone button that centers the map on the route
 * This version can be used directly in HTML without React components
 */
export function StandaloneCenterMapButton() {
  // Create the button element
  const button = document.createElement('button');

  // Add classes and attributes
  button.className = "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[36px] max-w-7xl mx-auto rounded-md transition-all duration-300 active:scale-[0.97] text-secondary-foreground hover:bg-secondary/80 hover:shadow-md ring-1 ring-secondary/20 hover:scale-[1.02] h-8 w-8 p-1.5 aspect-square text-xs bg-card/80 backdrop-blur-sm shadow-sm";
  button.setAttribute('data-slot', 'button');
  button.setAttribute('aria-label', 'Center map');
  button.setAttribute('title', 'Center map on route');

  // Add the Locate icon
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate h-4 w-4"><line x1="2" x2="5" y1="12" y2="12"></line><line x1="19" x2="22" y1="12" y2="12"></line><line x1="12" x2="12" y1="2" y2="5"></line><line x1="12" x2="12" y1="19" y2="22"></line><circle cx="12" cy="12" r="7"></circle></svg>`;

  // Add click event listener
  button.addEventListener('click', () => {
    try {
      console.log('Attempting to center map on route...');

      // Try multiple selectors to find the map container
      const selectors = [
        '.leaflet-container',
        '#map',
        '[class*="leaflet"]',
        '.map-container'
      ];

      let mapElement = null;
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`Found map element with selector: ${selector}`);
          mapElement = element;
          break;
        }
      }

      if (!mapElement) {
        console.error('Map element not found. The map might not be loaded yet.');
        // Try again after a short delay
        setTimeout(() => button.click(), 500);
        return;
      }

      // Try different ways to access the Leaflet map instance
      let map = null;

      // Method 1: Direct access via _leaflet_map property
      if (mapElement._leaflet_map) {
        console.log('Found map via _leaflet_map property');
        map = mapElement._leaflet_map;
      }
      // Method 2: Access via the Leaflet global object
      else if (window.L && window.L.map) {
        console.log('Attempting to find map via Leaflet global object');
        // Try to get the map instance from Leaflet
        const mapId = mapElement.id;
        if (mapId && window.L.map(mapId)) {
          map = window.L.map(mapId);
        }
      }
      // Method 3: Look for map instance in all elements
      else {
        console.log('Searching for map instance in DOM elements');
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          if (el._leaflet_map) {
            map = el._leaflet_map;
            console.log('Found map instance in element:', el);
            break;
          }
        }
      }

      if (!map) {
        console.error('Leaflet map instance not found. The map might not be initialized yet.');
        // Try again after a short delay
        setTimeout(() => button.click(), 500);
        return;
      }

      // Find the route layer
      const layers = map._layers;
      if (!layers) {
        console.error('No layers found in map');
        return;
      }

      const layerKeys = Object.keys(layers);
      console.log(`Found ${layerKeys.length} layers in map`);

      // Try to find a layer with getBounds method (likely the route)
      let routeLayer = null;

      // First, look for polyline layers (most likely to be routes)
      for (const key of layerKeys) {
        const layer = layers[key];
        if (layer._latlngs && layer.getBounds && typeof layer.getBounds === 'function') {
          console.log('Found potential route layer (polyline)');
          routeLayer = layer;
          break;
        }
      }

      // If no polyline found, try any layer with getBounds
      if (!routeLayer) {
        for (const key of layerKeys) {
          const layer = layers[key];
          if (layer.getBounds && typeof layer.getBounds === 'function') {
            console.log('Found layer with getBounds');
            routeLayer = layer;
            break;
          }
        }
      }

      // If still no layer found, try to use the map's bounds
      if (!routeLayer && map.getBounds) {
        console.log('No route layer found, using map bounds');
        map.fitBounds(map.getBounds());
        return;
      }

      if (!routeLayer) {
        console.error('Route layer not found');
        return;
      }

      // Center the map on the route bounds
      console.log('Centering map on route bounds');
      map.fitBounds(routeLayer.getBounds(), {
        padding: [50, 50],
        maxZoom: 14,
      });

      console.log('Map centered on route successfully');
    } catch (error) {
      console.error('Error centering map:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  });

  return button;
}
