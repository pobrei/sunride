'use client';

/**
 * Lazy Image Component
 * 
 * This component lazy loads images with a blur-up effect.
 */

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { usePerformance } from '@/components/performance/performance-provider';
import { useOptimizedImage } from '@/lib/image-utils';

/**
 * Lazy image props
 */
export interface LazyImageProps {
  /** Image source */
  src: string;
  /** Image alt text */
  alt: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Whether to use blur-up effect */
  blurUp?: boolean;
  /** Whether to use lazy loading */
  lazy?: boolean;
  /** Whether to use low quality image placeholder */
  lqip?: boolean;
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
  /** Whether to use responsive images */
  responsive?: boolean;
  /** Image quality */
  quality?: number;
  /** Image format */
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  /** Whether to use priority loading */
  priority?: boolean;
  /** Whether to fill container */
  fill?: boolean;
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Object position */
  objectPosition?: string;
  /** Whether to use placeholder */
  placeholder?: 'blur' | 'empty' | 'data:image/...' | undefined;
  /** Whether to use sizes attribute */
  sizes?: string;
  /** Whether to use loading attribute */
  loading?: 'lazy' | 'eager' | undefined;
  /** Whether to use decoding attribute */
  decoding?: 'async' | 'auto' | 'sync' | undefined;
  /** Whether to use fetchPriority attribute */
  fetchPriority?: 'high' | 'low' | 'auto' | undefined;
  /** Whether to use referrerPolicy attribute */
  referrerPolicy?: React.HTMLAttributeReferrerPolicy | undefined;
  /** Whether to use unoptimized attribute */
  unoptimized?: boolean;
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
 * Lazy image component
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  blurUp = true,
  lazy = true,
  lqip = true,
  optimizeForDevice = true,
  optimizeForNetwork = true,
  optimizeForBattery = true,
  optimizeForDataSaver = true,
  optimizeForLowMemory = true,
  optimizeForLowEndDevice = true,
  responsive = true,
  quality,
  format = 'auto',
  priority = false,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder,
  sizes,
  loading,
  decoding,
  fetchPriority,
  referrerPolicy,
  unoptimized = false,
  className,
  style,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const performance = usePerformance();
  
  // Get optimized image props
  const {
    quality: optimizedQuality,
    sources,
    placeholderSrc,
    lowQualitySrc,
  } = useOptimizedImage(src, alt, {
    quality: quality ? (quality === 100 ? 'high' : quality >= 75 ? 'medium' : 'low') : 'auto',
    format: format === 'auto' ? 'auto' : format,
    responsive,
    lazy,
    blurUp,
    lqip,
    optimizeForDevice,
    optimizeForNetwork,
    optimizeForBattery,
    optimizeForDataSaver,
    optimizeForLowMemory,
    optimizeForLowEndDevice,
  });
  
  // Determine if we should use low quality image
  const shouldUseLowQuality = performance.shouldReduceImageQuality && lowQualitySrc;
  
  // Determine image source
  const imageSrc = shouldUseLowQuality ? lowQualitySrc : src;
  
  // Determine loading strategy
  const loadingStrategy = priority ? 'eager' : lazy ? 'lazy' : loading;
  
  // Determine placeholder strategy
  const placeholderStrategy = placeholder || (blurUp && placeholderSrc ? 'blur' : 'empty');
  
  // Determine fetch priority
  const fetchPriorityStrategy = fetchPriority || (priority ? 'high' : 'auto');
  
  // Set up intersection observer
  useEffect(() => {
    if (!lazy || priority) {
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
        rootMargin: '200px',
        threshold: 0.01,
      }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [lazy, priority]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };
  
  return (
    <div
      ref={imageRef}
      className={cn(
        'relative overflow-hidden',
        isLoaded ? 'animate-fade-in' : 'animate-pulse',
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        ...style,
      }}
    >
      {(isVisible || !lazy || priority) && (
        <Image
          src={imageSrc || src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          quality={quality || optimizedQuality}
          priority={priority}
          fill={fill}
          sizes={sizes}
          loading={loadingStrategy}
          decoding={decoding || 'async'}
          fetchPriority={fetchPriorityStrategy}
          referrerPolicy={referrerPolicy}
          unoptimized={unoptimized}
          placeholder={placeholderStrategy}
          blurDataURL={placeholderSrc}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit,
            objectPosition,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
      
      {isError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/20"
          aria-hidden="true"
        >
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

export default LazyImage;
