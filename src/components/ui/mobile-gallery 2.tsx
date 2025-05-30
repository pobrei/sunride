'use client';

/**
 * MobileGallery Component
 * 
 * This component provides a mobile-friendly image gallery with swipe navigation
 * following iOS 19 design principles.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './button';
import SwipeContainer from './swipe-container';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface MobileGalleryProps {
  /** Array of images */
  images: Array<{
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  /** Initial image index */
  initialIndex?: number;
  /** Additional class names */
  className?: string;
  /** Whether to show navigation controls */
  showControls?: boolean;
  /** Whether to show pagination indicators */
  showPagination?: boolean;
  /** Whether to enable swipe navigation */
  enableSwipe?: boolean;
  /** Whether to enable pinch zoom */
  enableZoom?: boolean;
  /** Whether to show fullscreen mode */
  enableFullscreen?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Function called when the current image changes */
  onImageChange?: (index: number) => void;
  /** Function called when an image is clicked */
  onImageClick?: (index: number) => void;
}

/**
 * A mobile-friendly image gallery component with swipe navigation
 * following iOS 19 design principles
 */
export function MobileGallery({
  images,
  initialIndex = 0,
  className,
  showControls = true,
  showPagination = true,
  enableSwipe = true,
  enableZoom = true,
  enableFullscreen = true,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
  onImageChange,
  onImageClick,
}: MobileGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle image change
  const handleImageChange = (index: number) => {
    // Ensure index is within bounds
    const newIndex = Math.max(0, Math.min(index, images.length - 1));
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
      
      // Reset zoom when changing images
      setIsZoomed(false);
      setZoomLevel(1);
    }
  };

  // Handle next image
  const handleNext = () => {
    handleImageChange(currentIndex + 1);
  };

  // Handle previous image
  const handlePrevious = () => {
    handleImageChange(currentIndex - 1);
  };

  // Handle swipe left (next image)
  const handleSwipeLeft = () => {
    if (!enableSwipe || isZoomed) return;
    handleNext();
  };

  // Handle swipe right (previous image)
  const handleSwipeRight = () => {
    if (!enableSwipe || isZoomed) return;
    handlePrevious();
  };

  // Handle image click
  const handleImageClick = () => {
    if (enableFullscreen) {
      setIsFullscreen(!isFullscreen);
    }
    
    onImageClick?.(currentIndex);
  };

  // Handle zoom toggle
  const handleZoomToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!enableZoom) return;
    
    if (isZoomed) {
      setIsZoomed(false);
      setZoomLevel(1);
    } else {
      setIsZoomed(true);
      setZoomLevel(2);
    }
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Current image
  const currentImage = images[currentIndex];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        rounded && !isFullscreen && 'rounded-xl',
        bordered && !isFullscreen && 'border border-border/20',
        shadowed && !isFullscreen && 'shadow-sm',
        glass && !isFullscreen && 'bg-card/80 backdrop-blur-sm',
        isFullscreen && 'fixed inset-0 z-50 bg-black',
        className
      )}
    >
      {/* Fullscreen close button */}
      {isFullscreen && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/50 text-white"
          onClick={handleFullscreenToggle}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Zoom button */}
      {enableZoom && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-4 left-4 z-10 h-8 w-8 rounded-full',
            isFullscreen ? 'bg-black/50 text-white' : 'bg-card/80 backdrop-blur-sm'
          )}
          onClick={handleZoomToggle}
        >
          {isZoomed ? (
            <ZoomOut className="h-4 w-4" />
          ) : (
            <ZoomIn className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Image container */}
      <SwipeContainer
        className="w-full h-full"
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        disabled={!enableSwipe || isZoomed}
      >
        <div
          className={cn(
            'relative w-full h-full flex items-center justify-center',
            isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
          )}
          onClick={handleImageClick}
        >
          {currentImage && (
            <div
              className="relative w-full h-full"
              style={{
                transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt || `Image ${currentIndex + 1}`}
                width={currentImage.width || 1200}
                height={currentImage.height || 800}
                className="object-contain w-full h-full"
                priority
              />
            </div>
          )}
        </div>
      </SwipeContainer>

      {/* Navigation controls */}
      {showControls && images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute left-2 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full',
              isFullscreen ? 'bg-black/50 text-white' : 'bg-card/80 backdrop-blur-sm',
              currentIndex === 0 && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-2 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full',
              isFullscreen ? 'bg-black/50 text-white' : 'bg-card/80 backdrop-blur-sm',
              currentIndex === images.length - 1 && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Pagination indicators */}
      {showPagination && images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-primary w-4'
                  : 'bg-muted-foreground/30'
              )}
              onClick={() => handleImageChange(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MobileGallery;
