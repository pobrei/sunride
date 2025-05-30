'use client';

/**
 * Virtual List Component
 * 
 * This component efficiently renders large lists by only rendering items that are visible in the viewport.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { usePerformance } from '@/components/performance/performance-provider';

/**
 * Virtual list props
 */
export interface VirtualListProps<T> {
  /** Items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of items to render above and below the visible area */
  overscan?: number;
  /** Whether to use dynamic item heights */
  dynamicHeight?: boolean;
  /** Whether to use smooth scrolling */
  smoothScrolling?: boolean;
  /** Whether to use sticky headers */
  stickyHeaders?: boolean;
  /** Function to determine if an item is a header */
  isHeader?: (item: T, index: number) => boolean;
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
  /** Height of the list in pixels or CSS value */
  height?: number | string;
  /** Width of the list in pixels or CSS value */
  width?: number | string;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** On scroll callback */
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  /** On item visible callback */
  onItemVisible?: (index: number, item: T) => void;
  /** On item hidden callback */
  onItemHidden?: (index: number, item: T) => void;
  /** On reach top callback */
  onReachTop?: () => void;
  /** On reach bottom callback */
  onReachBottom?: () => void;
  /** On reach start callback */
  onReachStart?: () => void;
  /** On reach end callback */
  onReachEnd?: () => void;
}

/**
 * Virtual list component
 */
export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  dynamicHeight = false,
  smoothScrolling = true,
  stickyHeaders = false,
  isHeader,
  optimizeForDevice = true,
  optimizeForNetwork = true,
  optimizeForBattery = true,
  optimizeForDataSaver = true,
  optimizeForLowMemory = true,
  optimizeForLowEndDevice = true,
  height = 400,
  width = '100%',
  className,
  style,
  onScroll,
  onItemVisible,
  onItemHidden,
  onReachTop,
  onReachBottom,
  onReachStart,
  onReachEnd,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Record<number, HTMLDivElement>>({});
  const performance = usePerformance();
  
  // Determine if we should optimize rendering
  const shouldOptimizeRendering = 
    (optimizeForDevice && performance.isLowEndDevice) ||
    (optimizeForBattery && performance.isLowBattery) ||
    (optimizeForLowMemory && performance.isLowMemory) ||
    (optimizeForDataSaver && performance.isDataSaver) ||
    (optimizeForNetwork && (performance.isSlowConnection || performance.connectionType === '2g'));
  
  // Adjust overscan based on device capabilities
  const adjustedOverscan = shouldOptimizeRendering ? Math.min(overscan, 2) : overscan;
  
  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!containerRef.current) {
      return { start: 0, end: 10 };
    }
    
    const { clientHeight } = containerRef.current;
    const visibleItemCount = Math.ceil(clientHeight / itemHeight);
    
    let startIndex = Math.floor(scrollTop / itemHeight) - adjustedOverscan;
    startIndex = Math.max(0, startIndex);
    
    let endIndex = startIndex + visibleItemCount + 2 * adjustedOverscan;
    endIndex = Math.min(items.length - 1, endIndex);
    
    return { start: startIndex, end: endIndex };
  }, [scrollTop, itemHeight, items.length, adjustedOverscan]);
  
  // Update visible items
  useEffect(() => {
    const newVisibleItems: number[] = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      newVisibleItems.push(i);
    }
    
    // Find newly visible items
    const newlyVisible = newVisibleItems.filter(index => !visibleItems.includes(index));
    
    // Find newly hidden items
    const newlyHidden = visibleItems.filter(index => !newVisibleItems.includes(index));
    
    // Call callbacks
    if (onItemVisible) {
      newlyVisible.forEach(index => {
        if (index >= 0 && index < items.length) {
          onItemVisible(index, items[index]);
        }
      });
    }
    
    if (onItemHidden) {
      newlyHidden.forEach(index => {
        if (index >= 0 && index < items.length) {
          onItemHidden(index, items[index]);
        }
      });
    }
    
    setVisibleItems(newVisibleItems);
  }, [visibleRange, items, visibleItems, onItemVisible, onItemHidden]);
  
  // Handle scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    
    setScrollTop(scrollTop);
    
    if (onScroll) {
      onScroll(scrollTop, scrollHeight, clientHeight);
    }
    
    // Check if reached top
    if (scrollTop === 0 && onReachTop) {
      onReachTop();
    }
    
    // Check if reached bottom
    if (scrollTop + clientHeight >= scrollHeight - 10 && onReachBottom) {
      onReachBottom();
    }
    
    // Check if reached start
    if (scrollTop <= 10 && onReachStart) {
      onReachStart();
    }
    
    // Check if reached end
    if (scrollTop + clientHeight >= scrollHeight - 10 && onReachEnd) {
      onReachEnd();
    }
  };
  
  // Calculate total height
  const totalHeight = items.length * itemHeight;
  
  // Generate items
  const renderedItems = useMemo(() => {
    return visibleItems.map(index => {
      const item = items[index];
      const isVisible = true;
      const isHeaderItem = isHeader ? isHeader(item, index) : false;
      
      return (
        <div
          key={index}
          ref={el => {
            if (el) {
              itemsRef.current[index] = el;
            }
          }}
          className={cn(
            'absolute left-0 right-0',
            isHeaderItem && stickyHeaders && 'sticky top-0 z-10'
          )}
          style={{
            height: `${itemHeight}px`,
            top: `${index * itemHeight}px`,
            transform: smoothScrolling ? 'translate3d(0, 0, 0)' : undefined,
          }}
        >
          {renderItem(item, index, isVisible)}
        </div>
      );
    });
  }, [visibleItems, items, itemHeight, renderItem, isHeader, stickyHeaders, smoothScrolling]);
  
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-auto',
        className
      )}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        willChange: smoothScrolling ? 'transform' : undefined,
        ...style,
      }}
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{
          height: `${totalHeight}px`,
          width: '100%',
        }}
      >
        {renderedItems}
      </div>
    </div>
  );
}

export default VirtualList;
