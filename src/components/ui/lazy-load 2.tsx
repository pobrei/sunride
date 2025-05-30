'use client';

/**
 * LazyLoad Components
 * 
 * This file provides components for lazy loading content to improve performance
 * especially on mobile devices.
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * LazyImage Component
 * 
 * Lazily loads images when they enter the viewport.
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderClassName,
  loadingComponent,
  threshold = 0.1,
  placeholderSrc,
  onLoad,
  onError,
  ...props
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderClassName?: string;
  loadingComponent?: React.ReactNode;
  threshold?: number;
  placeholderSrc?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height' | 'onLoad' | 'onError'>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (!imgRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    observer.observe(imgRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const error = new Error(`Failed to load image: ${src}`);
    setError(error);
    onError?.(error);
  };
  
  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {/* Placeholder or loading indicator */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-muted/20',
            placeholderClassName
          )}
        >
          {placeholderSrc ? (
            <img
              src={placeholderSrc}
              alt=""
              className="w-full h-full object-cover blur-sm"
              aria-hidden="true"
            />
          ) : loadingComponent || (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          )}
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
          {...props}
        />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="text-sm text-muted-foreground text-center p-4">
            Failed to load image
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * LazyComponent Component
 * 
 * Lazily loads any component when it enters the viewport.
 */
export function LazyComponent({
  children,
  className,
  loadingComponent,
  threshold = 0.1,
  onVisible,
}: {
  children: React.ReactNode;
  className?: string;
  loadingComponent?: React.ReactNode;
  threshold?: number;
  onVisible?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold, onVisible]);
  
  return (
    <div ref={ref} className={className}>
      {isVisible ? children : loadingComponent}
    </div>
  );
}

/**
 * VirtualList Component
 * 
 * Renders only the items that are visible in the viewport.
 */
export function VirtualList<T>({
  items,
  renderItem,
  className,
  itemHeight = 50,
  overscan = 5,
  loadingComponent,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemHeight?: number;
  overscan?: number;
  loadingComponent?: React.ReactNode;
}) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: overscan * 2 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, clientHeight } = containerRef.current;
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const end = Math.min(
        items.length,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
      );
      
      setVisibleRange({ start, end });
    };
    
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [items.length, itemHeight, overscan]);
  
  const totalHeight = items.length * itemHeight;
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.length > 0 ? (
          visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{
                position: 'absolute',
                top: (visibleRange.start + index) * itemHeight,
                height: itemHeight,
                width: '100%',
              }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))
        ) : (
          loadingComponent
        )}
      </div>
    </div>
  );
}

export default {
  LazyImage,
  LazyComponent,
  VirtualList,
};
