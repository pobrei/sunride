'use client';

/**
 * SwipeContainer Component
 * 
 * This component provides swipe gesture functionality for mobile interactions
 * following iOS 19 design principles.
 */

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SwipeContainerProps {
  /** Children components */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Function called when swiped left */
  onSwipeLeft?: () => void;
  /** Function called when swiped right */
  onSwipeRight?: () => void;
  /** Function called when swiped up */
  onSwipeUp?: () => void;
  /** Function called when swiped down */
  onSwipeDown?: () => void;
  /** Minimum distance required to trigger swipe (in pixels) */
  threshold?: number;
  /** Whether to disable swipe gestures */
  disabled?: boolean;
  /** Whether to prevent default behavior */
  preventDefault?: boolean;
  /** Whether to stop propagation */
  stopPropagation?: boolean;
  /** Whether to show visual feedback */
  showFeedback?: boolean;
  /** Whether to enable horizontal swiping */
  horizontal?: boolean;
  /** Whether to enable vertical swiping */
  vertical?: boolean;
}

/**
 * A component that provides swipe gesture functionality for mobile interactions
 * following iOS 19 design principles
 */
export function SwipeContainer({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  disabled = false,
  preventDefault = true,
  stopPropagation = false,
  showFeedback = true,
  horizontal = true,
  vertical = true,
}: SwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  // Reset swipe direction after animation completes
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        setSwipeDirection(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection]);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    if (stopPropagation) e.stopPropagation();
    
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
    setTouchEnd(null);
    setSwiping(true);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !touchStart) return;
    if (stopPropagation) e.stopPropagation();
    if (preventDefault) e.preventDefault();
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStart || !touchEnd) return;
    if (stopPropagation) e.stopPropagation();
    
    setSwiping(false);
    
    // Calculate distance
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const absX = Math.abs(distanceX);
    const absY = Math.abs(distanceY);
    
    // Determine swipe direction
    if (horizontal && absX > threshold && absX > absY) {
      if (distanceX > 0) {
        setSwipeDirection('left');
        onSwipeLeft?.();
      } else {
        setSwipeDirection('right');
        onSwipeRight?.();
      }
    } else if (vertical && absY > threshold && absY > absX) {
      if (distanceY > 0) {
        setSwipeDirection('up');
        onSwipeUp?.();
      } else {
        setSwipeDirection('down');
        onSwipeDown?.();
      }
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative touch-pan-y',
        showFeedback && swipeDirection === 'left' && 'animate-swipe-left',
        showFeedback && swipeDirection === 'right' && 'animate-swipe-right',
        showFeedback && swipeDirection === 'up' && 'animate-swipe-up',
        showFeedback && swipeDirection === 'down' && 'animate-swipe-down',
        swiping && 'cursor-grabbing',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

export default SwipeContainer;
