'use client';

import { useEffect, useState } from 'react';
import { supportsFeature } from '@/lib/performance';

interface PerformanceFeatures {
  supportsWebP: boolean;
  supportsAvif: boolean;
  supportsIntersectionObserver: boolean;
  supportsResizeObserver: boolean;
  supportsMutationObserver: boolean;
  supportsWebGL: boolean;
  supportsWebGL2: boolean;
  supportsWebWorker: boolean;
  supportsSharedWorker: boolean;
  supportsServiceWorker: boolean;
  isLowEndDevice: boolean;
  isLowMemoryDevice: boolean;
  isBatteryLow: boolean;
  isDataSaverEnabled: boolean;
  isReducedMotionPreferred: boolean;
  isHighContrastPreferred: boolean;
}

/**
 * A hook that provides information about performance features
 * @returns Performance features
 */
export function usePerformanceOptimization(): PerformanceFeatures & { 
  shouldReduceMotion: boolean;
  shouldReduceQuality: boolean;
  shouldDeferNonEssential: boolean;
} {
  const [features, setFeatures] = useState<PerformanceFeatures>({
    supportsWebP: false,
    supportsAvif: false,
    supportsIntersectionObserver: false,
    supportsResizeObserver: false,
    supportsMutationObserver: false,
    supportsWebGL: false,
    supportsWebGL2: false,
    supportsWebWorker: false,
    supportsSharedWorker: false,
    supportsServiceWorker: false,
    isLowEndDevice: false,
    isLowMemoryDevice: false,
    isBatteryLow: false,
    isDataSaverEnabled: false,
    isReducedMotionPreferred: false,
    isHighContrastPreferred: false,
  });

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') {
      return;
    }

    // Check feature support
    const supportsWebP = supportsFeature('webp');
    const supportsAvif = supportsFeature('avif');
    const supportsIntersectionObserver = supportsFeature('intersectionObserver');
    const supportsResizeObserver = supportsFeature('resizeObserver');
    const supportsMutationObserver = supportsFeature('mutationObserver');
    const supportsWebGL = supportsFeature('webgl');
    const supportsWebGL2 = supportsFeature('webgl2');
    const supportsWebWorker = supportsFeature('webworker');
    const supportsSharedWorker = supportsFeature('sharedworker');
    const supportsServiceWorker = supportsFeature('serviceworker');

    // Check device capabilities
    const isLowEndDevice = 
      navigator.hardwareConcurrency !== undefined && 
      navigator.hardwareConcurrency <= 4;
    
    const isLowMemoryDevice = 
      // @ts-ignore - deviceMemory is not in the standard TypeScript types
      navigator.deviceMemory !== undefined && 
      // @ts-ignore
      navigator.deviceMemory <= 4;

    // Check battery status if available
    let isBatteryLow = false;
    if ('getBattery' in navigator) {
      // @ts-ignore - getBattery is not in the standard TypeScript types
      navigator.getBattery().then((battery) => {
        isBatteryLow = battery.level <= 0.2 && !battery.charging;
        
        setFeatures(prev => ({
          ...prev,
          isBatteryLow
        }));
        
        // Listen for battery changes
        battery.addEventListener('levelchange', () => {
          const newIsBatteryLow = battery.level <= 0.2 && !battery.charging;
          
          setFeatures(prev => ({
            ...prev,
            isBatteryLow: newIsBatteryLow
          }));
        });
        
        battery.addEventListener('chargingchange', () => {
          const newIsBatteryLow = battery.level <= 0.2 && !battery.charging;
          
          setFeatures(prev => ({
            ...prev,
            isBatteryLow: newIsBatteryLow
          }));
        });
      }).catch(() => {
        // Battery API not available or permission denied
      });
    }

    // Check data saver
    const isDataSaverEnabled = 
      navigator.connection !== undefined && 
      // @ts-ignore - saveData is not in the standard TypeScript types
      navigator.connection.saveData === true;

    // Check reduced motion preference
    const isReducedMotionPreferred = 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check high contrast preference
    const isHighContrastPreferred = 
      window.matchMedia('(prefers-contrast: more)').matches;

    // Update state
    setFeatures({
      supportsWebP,
      supportsAvif,
      supportsIntersectionObserver,
      supportsResizeObserver,
      supportsMutationObserver,
      supportsWebGL,
      supportsWebGL2,
      supportsWebWorker,
      supportsSharedWorker,
      supportsServiceWorker,
      isLowEndDevice,
      isLowMemoryDevice,
      isBatteryLow,
      isDataSaverEnabled,
      isReducedMotionPreferred,
      isHighContrastPreferred,
    });

    // Listen for reduced motion preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setFeatures(prev => ({
        ...prev,
        isReducedMotionPreferred: e.matches
      }));
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Listen for high contrast preference changes
    const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setFeatures(prev => ({
        ...prev,
        isHighContrastPreferred: e.matches
      }));
    };
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Cleanup
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  // Derived values
  const shouldReduceMotion = features.isReducedMotionPreferred;
  
  const shouldReduceQuality = 
    features.isLowEndDevice || 
    features.isLowMemoryDevice || 
    features.isBatteryLow || 
    features.isDataSaverEnabled;
  
  const shouldDeferNonEssential = 
    features.isLowEndDevice || 
    features.isLowMemoryDevice || 
    features.isBatteryLow;

  return {
    ...features,
    shouldReduceMotion,
    shouldReduceQuality,
    shouldDeferNonEssential,
  };
}
