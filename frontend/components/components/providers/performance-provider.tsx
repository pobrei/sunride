'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePerformanceOptimization } from '@frontend/hooks/usePerformanceOptimization';

interface PerformanceContextType {
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
  shouldReduceMotion: boolean;
  shouldReduceQuality: boolean;
  shouldDeferNonEssential: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
}

/**
 * A provider component that provides performance optimization information
 */
export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const performanceFeatures = usePerformanceOptimization();

  return (
    <PerformanceContext.Provider value={performanceFeatures}>
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * A hook that provides access to performance optimization information
 */
export function usePerformance(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  
  return context;
}
