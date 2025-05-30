'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ResponsiveMapProps {
  /** Map content */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Map title */
  title?: string;
  /** Map description */
  description?: string;
  /** Map height */
  height?: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Whether to add a border to the map */
  bordered?: boolean;
  /** Whether to add a shadow to the map */
  shadowed?: boolean;
  /** Whether to add a rounded corner to the map */
  rounded?: boolean;
  /** Whether to add a background color to the map */
  background?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to add padding to the map */
  padding?: boolean;
  /** Whether to show a loading state */
  loading?: boolean;
  /** Whether to show map controls */
  showControls?: boolean;
  /** Whether to show a fullscreen button */
  showFullscreenButton?: boolean;
  /** Whether to show a legend */
  showLegend?: boolean;
  /** Legend items */
  legendItems?: Array<{ color: string; label: string }>;
}

/**
 * A responsive map component that follows iOS 19 design principles
 */
export function ResponsiveMap({
  children,
  className,
  title,
  description,
  height = 'md',
  bordered = true,
  shadowed = true,
  rounded = true,
  background = true,
  glass = false,
  padding = false,
  loading = false,
  showControls = true,
  showFullscreenButton = true,
  showLegend = false,
  legendItems = [],
}: ResponsiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Map height to Tailwind classes or pixel values
  const getHeightClass = () => {
    if (isFullscreen) {
      return 'h-screen w-screen fixed inset-0 z-50';
    }
    
    if (typeof height === 'number') {
      return `h-[${height}px]`;
    }
    
    const heightClasses = {
      auto: 'h-auto',
      sm: 'h-[200px] sm:h-[250px] md:h-[300px]',
      md: 'h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px]',
      lg: 'h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]',
      xl: 'h-[350px] sm:h-[450px] md:h-[600px] lg:h-[700px]',
    };
    
    return heightClasses[height];
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);
  
  return (
    <Card
      className={cn(
        'overflow-hidden relative',
        getHeightClass(),
        isFullscreen && 'rounded-none border-0',
        className
      )}
      variant={background ? (glass ? 'glass' : 'default') : 'ghost'}
      size={padding ? 'default' : 'none'}
      hover="none"
      rounded={rounded && !isFullscreen ? 'lg' : 'none'}
      glass={glass}
      interactive={false}
    >
      {!isFullscreen && (title || description) && (
        <div className="absolute top-2 left-2 right-2 z-10 bg-card/80 backdrop-blur-sm p-2 rounded-md">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      
      {showFullscreenButton && (
        <button
          className="absolute top-2 right-2 z-10 bg-card/80 backdrop-blur-sm p-1.5 rounded-md hover:bg-card transition-colors duration-200"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8V5a2 2 0 0 1 2-2h3"></path>
              <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
              <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
              <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
            </svg>
          )}
        </button>
      )}
      
      <div
        ref={mapRef}
        className="w-full h-full"
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
      
      {showLegend && legendItems.length > 0 && (
        <div className="absolute bottom-2 left-2 z-10 bg-card/80 backdrop-blur-sm p-2 rounded-md">
          <div className="flex flex-col gap-1">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default ResponsiveMap;
