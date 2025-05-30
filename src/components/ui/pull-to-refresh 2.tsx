'use client';

/**
 * PullToRefresh Component
 * 
 * This component provides pull-to-refresh functionality for mobile interactions
 * following iOS 19 design principles.
 */

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownCircle, RefreshCcw } from 'lucide-react';

interface PullToRefreshProps {
  /** Children components */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Function called when refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Pull distance threshold to trigger refresh (in pixels) */
  threshold?: number;
  /** Maximum pull distance (in pixels) */
  maxPullDistance?: number;
  /** Whether to disable pull-to-refresh */
  disabled?: boolean;
  /** Whether to show the pull indicator */
  showIndicator?: boolean;
  /** Custom loading indicator */
  loadingIndicator?: React.ReactNode;
  /** Custom pull indicator */
  pullIndicator?: React.ReactNode;
  /** Text to show when pulling */
  pullText?: string;
  /** Text to show when refreshing */
  refreshingText?: string;
  /** Text to show when release will trigger refresh */
  releaseText?: string;
}

/**
 * A component that provides pull-to-refresh functionality for mobile interactions
 * following iOS 19 design principles
 */
export function PullToRefresh({
  children,
  className,
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
  showIndicator = true,
  loadingIndicator,
  pullIndicator,
  pullText = 'Pull to refresh',
  refreshingText = 'Refreshing...',
  releaseText = 'Release to refresh',
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(false);

  // Check if we're at the top of the container
  const checkIfAtTop = () => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      setIsAtTop(scrollTop <= 0);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkIfAtTop);
      return () => container.removeEventListener('scroll', checkIfAtTop);
    }
  }, []);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || refreshing) return;
    checkIfAtTop();
    setTouchStartY(e.touches[0].clientY);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || refreshing || !isAtTop) return;
    
    const touchY = e.touches[0].clientY;
    const pullDist = Math.max(0, Math.min(touchY - touchStartY, maxPullDistance));
    
    if (pullDist > 0) {
      e.preventDefault();
      setPullDistance(pullDist);
    }
  };

  // Handle touch end
  const handleTouchEnd = async () => {
    if (disabled || refreshing || !isAtTop) return;
    
    if (pullDistance >= threshold) {
      setRefreshing(true);
      setPullDistance(0);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Default loading indicator
  const defaultLoadingIndicator = (
    <div className="flex flex-col items-center justify-center p-4">
      <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
      <span className="mt-2 text-sm text-muted-foreground">{refreshingText}</span>
    </div>
  );

  // Default pull indicator
  const defaultPullIndicator = (
    <div 
      className="flex flex-col items-center justify-center p-4 transition-transform"
      style={{ 
        transform: pullDistance >= threshold ? 'rotate(180deg)' : 'rotate(0deg)',
        opacity: Math.min(1, pullDistance / threshold)
      }}
    >
      <ArrowDownCircle className="h-6 w-6 text-primary" />
      <span className="mt-2 text-sm text-muted-foreground">
        {pullDistance >= threshold ? releaseText : pullText}
      </span>
    </div>
  );

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {showIndicator && (
        <div 
          className="absolute left-0 right-0 flex justify-center transition-transform"
          style={{ 
            transform: `translateY(${pullDistance > 0 ? '0' : '-100%'})`,
            top: `-${maxPullDistance}px`,
            height: `${maxPullDistance}px`
          }}
        >
          {pullIndicator || defaultPullIndicator}
        </div>
      )}
      
      {/* Content container */}
      <div 
        ref={containerRef}
        className="h-full overflow-auto"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance > 0 ? 'none' : 'transform 0.3s ease'
        }}
      >
        {/* Loading indicator */}
        {refreshing && showIndicator && (
          <div className="sticky top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm">
            {loadingIndicator || defaultLoadingIndicator}
          </div>
        )}
        
        {/* Children content */}
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh;
