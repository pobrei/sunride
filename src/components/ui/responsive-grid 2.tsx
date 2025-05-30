'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  /** Grid items */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Number of columns on mobile */
  mobileColumns?: 1 | 2;
  /** Number of columns on tablet */
  tabletColumns?: 1 | 2 | 3 | 4;
  /** Number of columns on desktop */
  desktopColumns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Number of columns on large desktop */
  largeDesktopColumns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Gap between grid items */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to add a border to the grid items */
  itemBordered?: boolean;
  /** Whether to add a shadow to the grid items */
  itemShadowed?: boolean;
  /** Whether to add a rounded corner to the grid items */
  itemRounded?: boolean;
  /** Whether to add a background color to the grid items */
  itemBackground?: boolean;
  /** Whether to add a hover effect to the grid items */
  itemHover?: boolean;
}

/**
 * A responsive grid component that follows iOS 19 design principles
 */
export function ResponsiveGrid({
  children,
  className,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  largeDesktopColumns = 4,
  gap = 'md',
  itemBordered = false,
  itemShadowed = false,
  itemRounded = false,
  itemBackground = false,
  itemHover = false,
}: ResponsiveGridProps) {
  // Map columns to Tailwind classes
  const mobileColumnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
  };

  const tabletColumnClasses = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  const desktopColumnClasses = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  };

  const largeDesktopColumnClasses = {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    7: 'xl:grid-cols-7',
    8: 'xl:grid-cols-8',
  };

  // Map gap to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
    xl: 'gap-6 sm:gap-8 lg:gap-10',
  };

  // Apply styles to children
  const childrenWithStyles = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child, {
      className: cn(
        child.props.className,
        itemBordered && 'border border-border/40',
        itemShadowed && 'shadow-sm',
        itemRounded && 'rounded-lg',
        itemBackground && 'bg-card',
        itemHover && 'transition-all duration-200 hover:shadow-md hover:-translate-y-1'
      ),
    });
  });

  return (
    <div
      className={cn(
        'grid w-full',
        mobileColumnClasses[mobileColumns],
        tabletColumnClasses[tabletColumns],
        desktopColumnClasses[desktopColumns],
        largeDesktopColumnClasses[largeDesktopColumns],
        gapClasses[gap],
        className
      )}
    >
      {childrenWithStyles}
    </div>
  );
}

export default ResponsiveGrid;
