import { useCallback } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { useNotifications } from '@/hooks/useNotifications';
import { GPXData } from '@/types';
import gsap from 'gsap';

/**
 * Custom hook for handling GPX data operations
 */
export function useGPXHandler() {
  const { setGpxData, setSelectedMarker } = useWeather();
  const { addNotification } = useNotifications();

  /**
   * Handle GPX file upload
   */
  const handleGPXLoaded = useCallback((data: GPXData) => {
    setGpxData(data);
    setSelectedMarker(null);

    // Show success notification
    const routeName = data.name || 'Unnamed route';
    addNotification('success', `Route loaded successfully: ${routeName} (${data.points.length} points)`);

    // Animate map container after render
    setTimeout(() => {
      const mapContainer = document.querySelector('.map-container');
      if (mapContainer) {
        gsap.fromTo(
          '.map-container',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
      }
    }, 0);
  }, [setGpxData, setSelectedMarker, addNotification]);

  /**
   * Handle marker selection from different components
   */
  const handleMarkerSelect = useCallback((index: number) => {
    setSelectedMarker(index);
  }, [setSelectedMarker]);

  return {
    handleGPXLoaded,
    handleMarkerSelect
  };
}
