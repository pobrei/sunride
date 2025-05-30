'use client';

/**
 * Lazy Component
 * 
 * This component lazy loads its children when they enter the viewport.
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { usePerformance } from '@/components/performance/performance-provider';

/**
 * Lazy component props
 */
export interface LazyComponentProps {
  /** Children components */
  children: React.ReactNode;
  /** Loading component to show while the main component is loading */
  loadingComponent?: React.ReactNode;
  /** Whether to use lazy loading */
  lazy?: boolean;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether to use fade-in animation */
  fadeIn?: boolean;
  /** Fade-in duration in milliseconds */
  fadeInDuration?: number;
  /** Whether to use slide-up animation */
  slideUp?: boolean;
  /** Slide-up duration in milliseconds */
  slideUpDuration?: number;
  /** Whether to use scale-up animation */
  scaleUp?: boolean;
  /** Scale-up duration in milliseconds */
  scaleUpDuration?: number;
  /** Whether to use stagger animation */
  stagger?: boolean;
  /** Stagger delay in milliseconds */
  staggerDelay?: number;
  /** Whether to optimize for device capabilities */
  optimizeForDevice?: boolean;
  /** Whether to optimize for network conditions */
  optimizeForNetwork?: boolean;
  /** Whether to optimize for battery level */
  optimizeForBattery?: boolean;
  /** Whether to optimize for data saver mode */
  optimizeForDataSaver?: boolean;
  /** Whether to optimize for low memory */
  optimizeForLowMemory?: boolean;
  /** Whether to optimize for low-end devices */
  optimizeForLowEndDevice?: boolean;
  /** Whether to use priority loading */
  priority?: boolean;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** On load callback */
  onLoad?: () => void;
  /** On error callback */
  onError?: () => void;
}

/**
 * Lazy component
 */
export function LazyComponent({
  children,
  loadingComponent,
  lazy = true,
  threshold = 0.01,
  rootMargin = '200px',
  fadeIn = true,
  fadeInDuration = 300,
  slideUp = false,
  slideUpDuration = 300,
  scaleUp = false,
  scaleUpDuration = 300,
  stagger = false,
  staggerDelay = 100,
  optimizeForDevice = true,
  optimizeForNetwork = true,
  optimizeForBattery = true,
  optimizeForDataSaver = true,
  optimizeForLowMemory = true,
  optimizeForLowEndDevice = true,
  priority = false,
  className,
  style,
  onLoad,
  onError,
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const performance = usePerformance();
  
  // Determine if we should disable animations
  const shouldDisableAnimations = performance.hasReducedMotion || 
    (optimizeForDevice && performance.isLowEndDevice) ||
    (optimizeForBattery && performance.isLowBattery) ||
    (optimizeForLowMemory && performance.isLowMemory);
  
  // Determine if we should use lazy loading
  const shouldUseLazyLoading = lazy && 
    !priority && 
    !(optimizeForNetwork && performance.isHighEndNetwork);
  
  // Set up intersection observer
  useEffect(() => {
    if (!shouldUseLazyLoading) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );
    
    if (componentRef.current) {
      observer.observe(componentRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [shouldUseLazyLoading, rootMargin, threshold]);
  
  // Handle component load
  useEffect(() => {
    if (isVisible) {
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoaded(true);
        onLoad?.();
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible, onLoad]);
  
  // Generate animation styles
  const getAnimationStyles = () => {
    if (shouldDisableAnimations) {
      return {};
    }
    
    const styles: React.CSSProperties = {};
    
    if (fadeIn && isLoaded) {
      styles.opacity = 0;
      styles.animation = `fadeIn ${fadeInDuration}ms ease-in-out forwards`;
    }
    
    if (slideUp && isLoaded) {
      styles.transform = 'translateY(20px)';
      styles.animation = `slideUp ${slideUpDuration}ms ease-in-out forwards`;
    }
    
    if (scaleUp && isLoaded) {
      styles.transform = 'scale(0.95)';
      styles.animation = `scaleUp ${scaleUpDuration}ms ease-in-out forwards`;
    }
    
    if (stagger && isLoaded) {
      styles.animationDelay = `${staggerDelay}ms`;
    }
    
    return styles;
  };
  
  // Handle error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };
  
  return (
    <div
      ref={componentRef}
      className={cn(
        'relative',
        className
      )}
      style={{
        ...style,
        ...getAnimationStyles(),
      }}
    >
      {isVisible ? (
        isLoaded ? (
          <div className="w-full h-full">
            {children}
          </div>
        ) : (
          loadingComponent || (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )
        )
      ) : (
        loadingComponent || (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse rounded-lg bg-muted/20 w-full h-full min-h-[100px]"></div>
          </div>
        )
      )}
      
      {isError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/20"
          aria-hidden="true"
        >
          <span className="text-muted-foreground text-sm">Failed to load component</span>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default LazyComponent;
