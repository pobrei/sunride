'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { initializeChartDefaults } from '@/lib/chart-init';
import { initPerformanceMonitoring } from '@/lib/analytics';

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

  // Initialize Chart.js defaults and performance monitoring when the component mounts
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Add a small delay to avoid conflicts with ChartInitializer
    const timer = setTimeout(() => {
      console.log('Chart.js initialized by PerformanceProvider (fallback)');
      initializeChartDefaults();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
