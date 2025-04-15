'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  withBlur?: boolean;
  withAnimation?: boolean;
}

/**
 * A responsive image component with lazy loading and fallback
 */
export function ResponsiveImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  quality = 85,
  fill = false,
  style,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.svg',
  aspectRatio = '16/9',
  objectFit = 'cover',
  rounded = false,
  withBlur = true,
  withAnimation = true,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Reset loading and error state when src changes
  useEffect(() => {
    setIsLoading(!priority);
    setError(false);
    setImageSrc(src);
  }, [src, priority]);

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setError(true);
    setImageSrc(fallbackSrc);
    if (onError) onError();
  };

  // Determine rounded corner classes
  const roundedClasses = {
    true: 'rounded-md',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Combine styles
  const combinedStyle = {
    ...style,
    objectFit,
    aspectRatio: fill ? undefined : aspectRatio,
  };

  // Determine aspect ratio class
  const getAspectRatioClass = () => {
    if (fill) return '';

    // Common aspect ratios
    switch (aspectRatio) {
      case '16/9': return 'aspect-video';
      case '1/1': return 'aspect-square';
      case '4/3': return 'aspect-[4/3]';
      case '21/9': return 'aspect-[21/9]';
      default: return `aspect-[${aspectRatio}]`;
    }
  };

  // Determine container classes
  const containerClasses = cn(
    'overflow-hidden',
    getAspectRatioClass(),
    rounded && (typeof rounded === 'boolean' ? roundedClasses.true : roundedClasses[rounded]),
    className
  );

  return (
    <div className={containerClasses}>
      <AnimatePresence mode="wait">
        {withAnimation ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            {isLoading && withBlur && (
              <div className="absolute inset-0 bg-muted/30 backdrop-blur-[2px] animate-pulse" />
            )}
            <Image
              src={imageSrc}
              alt={alt}
              width={fill ? undefined : width}
              height={fill ? undefined : height}
              sizes={sizes}
              priority={priority}
              quality={quality}
              fill={fill}
              style={combinedStyle}
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                'transition-opacity duration-300',
                isLoading ? 'opacity-0' : 'opacity-100'
              )}
            />
          </motion.div>
        ) : (
          <div className="relative h-full w-full">
            {isLoading && withBlur && (
              <div className="absolute inset-0 bg-muted/30 backdrop-blur-[2px] animate-pulse" />
            )}
            <Image
              src={imageSrc}
              alt={alt}
              width={fill ? undefined : width}
              height={fill ? undefined : height}
              sizes={sizes}
              priority={priority}
              quality={quality}
              fill={fill}
              style={combinedStyle}
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                'transition-opacity duration-300',
                isLoading ? 'opacity-0' : 'opacity-100'
              )}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
