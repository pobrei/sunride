/**
 * Map Button Fix
 *
 * This script fixes the locate button by adding the proper event handler.
 * It should be included in the main application to ensure the button works correctly.
 */

// Function to fix the locate button
function fixLocateButton() {
  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFix);
  } else {
    setTimeout(initFix, 1000); // Delay to ensure map is loaded
  }

  // Initialize the fix
  function initFix() {
    // Track retry attempts
    if (!window._buttonFixRetries) {
      window._buttonFixRetries = 0;
    }

    // Find all buttons with the locate icon using multiple selectors
    const locateButtons = document.querySelectorAll('button svg.lucide-locate, svg.lucide-locate');
    const centerMapButtons = document.querySelectorAll('button[aria-label="Center map"], button[title*="Center map"]');

    // Check if we found any buttons
    if (locateButtons.length === 0 && centerMapButtons.length === 0) {
      // If no buttons found, try again with exponential backoff
      window._buttonFixRetries++;

      // Limit retries to prevent infinite loops
      if (window._buttonFixRetries > 10) {
        console.warn('Giving up on finding locate buttons after multiple attempts');
        window._buttonFixRetries = 0;
        return;
      }

      const delay = Math.min(500 * window._buttonFixRetries, 5000);
      setTimeout(initFix, delay);
      return;
    }

    // Reset retry counter since we found buttons
    window._buttonFixRetries = 0;

    // Process buttons with locate icon
    locateButtons.forEach(svg => {
      const button = svg.closest('button');
      if (button && !button._hasLocateHandler) {
        button._hasLocateHandler = true;

        try {
          // Remove any existing click handlers
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);

            // Add new click handler
            newButton.addEventListener('click', centerMapOnRoute);
            console.log('Added click handler to locate button');
          }
        } catch (error) {
          console.warn('Error replacing button:', error);
          // Fallback: just add the handler to the existing button
          button.addEventListener('click', centerMapOnRoute);
        }
      }
    });

    // Process center map buttons
    centerMapButtons.forEach(button => {
      if (!button._hasLocateHandler) {
        button._hasLocateHandler = true;

        try {
          // Remove any existing click handlers
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);

            // Add new click handler
            newButton.addEventListener('click', centerMapOnRoute);
            console.log('Added click handler to center map button');
          }
        } catch (error) {
          console.warn('Error replacing button:', error);
          // Fallback: just add the handler to the existing button
          button.addEventListener('click', centerMapOnRoute);
        }
      }
    });

    // Also look for standalone buttons
    const standaloneButtons = document.querySelectorAll('button[data-slot="button"]');
    standaloneButtons.forEach(button => {
      const svg = button.querySelector('svg.lucide-locate');
      if (svg && !button._hasLocateHandler) {
        button._hasLocateHandler = true;

        try {
          // Remove any existing click handlers
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);

            // Add new click handler
            newButton.addEventListener('click', centerMapOnRoute);
            console.log('Added click handler to standalone button');
          }
        } catch (error) {
          console.warn('Error replacing button:', error);
          // Fallback: just add the handler to the existing button
          button.addEventListener('click', centerMapOnRoute);
        }
      }
    });
  }

  // Function to center the map on the route
  function centerMapOnRoute() {
    try {
      console.log('Attempting to center map on route...');

      // Track retries to prevent infinite loops
      if (!window._mapCenterRetries) {
        window._mapCenterRetries = 0;
      }

      // Limit retries to prevent console spam
      if (window._mapCenterRetries > 5) {
        console.warn('Giving up on centering map after multiple attempts');
        window._mapCenterRetries = 0;
        return;
      }

      // Try multiple selectors to find the map container
      const selectors = [
        '.leaflet-container',
        '#map',
        '[class*="leaflet"]',
        '.map-container',
        'div[aria-label="Interactive map showing route and weather data"]'
      ];

      let mapElement = null;
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log('Found map element with selector: ' + selector);
          mapElement = element;
          break;
        }
      }

      if (!mapElement) {
        console.log('Map element not found. The map might not be loaded yet.');
        // Try again after a short delay, with exponential backoff
        window._mapCenterRetries++;
        const delay = Math.min(1000 * window._mapCenterRetries, 5000);
        setTimeout(centerMapOnRoute, delay);
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
        // Limit the search to direct children of the map container to improve performance
        const mapChildren = mapElement.querySelectorAll('*');
        for (const el of mapChildren) {
          if (el._leaflet_map) {
            map = el._leaflet_map;
            console.log('Found map instance in element:', el);
            break;
          }
        }
      }

      if (!map) {
        console.log('Leaflet map instance not found. The map might not be initialized yet.');
        // Try again after a short delay, with exponential backoff
        window._mapCenterRetries++;
        const delay = Math.min(1000 * window._mapCenterRetries, 5000);
        setTimeout(centerMapOnRoute, delay);
        return;
      }

      // Reset retry counter since we found the map
      window._mapCenterRetries = 0;

      // Find the route layer
      const layers = map._layers;
      if (!layers) {
        console.log('No layers found in map');
        return;
      }

      const layerKeys = Object.keys(layers);
      console.log('Found ' + layerKeys.length + ' layers in map');

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
        console.log('Route layer not found, but map was found. Centering on current view.');
        // Just center on current view if we can't find a specific layer
        map.setZoom(map.getZoom());
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
  }
}

// Run the fix when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initial fix
  fixLocateButton();

  // Set up a mutation observer to detect when new buttons are added
  const observer = new MutationObserver(function(mutations) {
    let shouldFix = false;

    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.nodeType === 1) { // Element node
            if (node.querySelector('svg.lucide-locate') ||
                (node.tagName === 'BUTTON' && node.querySelector('svg.lucide-locate'))) {
              shouldFix = true;
              break;
            }
          }
        }
      }
    });

    if (shouldFix) {
      fixLocateButton();
    }
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
