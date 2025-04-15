'use client';

import React, { memo, useCallback } from 'react';
import { cn } from '@shared/lib/utils';
import { getDynamicHeightClass, getDynamicTopClass } from '@shared/styles/dynamic-height';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  className?: string;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
  onItemClick?: (item: T, index: number) => void;
  emptyMessage?: React.ReactNode;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * A performance-optimized list component that only re-renders changed items
 */
export function OptimizedList<T>({
  items,
  renderItem,
  getItemKey,
  className,
  containerProps,
  onItemClick,
  emptyMessage = 'No items to display',
  isLoading = false,
  loadingComponent = <div className="animate-pulse p-4">Loading...</div>,
}: OptimizedListProps<T>) {
  // Memoize the click handler to prevent unnecessary re-renders
  const handleItemClick = useCallback(
    (item: T, index: number) => {
      if (onItemClick) {
        onItemClick(item, index);
      }
    },
    [onItemClick]
  );

  // Show loading state if loading
  if (isLoading) {
    return <div className={cn(className)}>{loadingComponent}</div>;
  }

  // Show empty message if no items
  if (items.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn(className)} {...containerProps}>
      {items.map((item, index) => (
        <MemoizedItem
          key={getItemKey(item, index)}
          item={item}
          index={index}
          renderItem={renderItem}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
}

interface ItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onClick: (item: T, index: number) => void;
}

// Memoized item component to prevent unnecessary re-renders
const MemoizedItem = memo(
  function Item<T>({ item, index, renderItem, onClick }: ItemProps<T>) {
    const handleClick = () => {
      onClick(item, index);
    };

    const renderedItem = renderItem(item, index);

    // If the rendered item is a React element, clone it to add the click handler
    if (React.isValidElement(renderedItem)) {
      return React.cloneElement(renderedItem, {
        onClick: (e: React.MouseEvent) => {
          // Call the original onClick if it exists
          if (renderedItem.props.onClick) {
            renderedItem.props.onClick(e);
          }
          handleClick();
        },
      });
    }

    // Otherwise, wrap it in a div with the click handler
    return <div onClick={handleClick}>{renderedItem}</div>;
  },
  // Custom comparison function for memoization
  (prevProps, nextProps) => {
    // Only re-render if the item or index has changed
    return prevProps.item === nextProps.item && prevProps.index === nextProps.index;
  }
);

/**
 * A virtualized list component that only renders visible items
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  getItemKey,
  className,
  containerProps,
  onItemClick,
  emptyMessage = 'No items to display',
  isLoading = false,
  loadingComponent = <div className="animate-pulse p-4">Loading...</div>,
  itemHeight = 50,
  overscan = 5,
}: OptimizedListProps<T> & { itemHeight: number; overscan?: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  // Update scroll position when container is scrolled
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Calculate visible items based on scroll position
  const totalHeight = items.length * itemHeight;
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEndIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + (containerRef.current?.clientHeight || 0)) / itemHeight) + overscan
  );
  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex + 1);

  // Memoize the click handler to prevent unnecessary re-renders
  const handleItemClick = useCallback(
    (item: T, index: number) => {
      if (onItemClick) {
        onItemClick(item, index);
      }
    },
    [onItemClick]
  );

  // Show loading state if loading
  if (isLoading) {
    return <div className={cn(className)}>{loadingComponent}</div>;
  }

  // Show empty message if no items
  if (items.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      onScroll={handleScroll}
      {...containerProps}
    >
      <div className={cn("relative", `h-[${totalHeight}px]`)}>
        {visibleItems.map((item, index) => {
          const actualIndex = visibleStartIndex + index;
          return (
            <div
              key={getItemKey(item, actualIndex)}
              className={cn(
                "absolute w-full",
                getDynamicTopClass(actualIndex * itemHeight),
                getDynamicHeightClass(itemHeight)
              )}
            >
              <MemoizedItem
                item={item}
                index={actualIndex}
                renderItem={renderItem}
                onClick={handleItemClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
