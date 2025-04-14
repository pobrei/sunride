'use client';

import React from 'react';
import { classNames } from '@/utils/classNames';
import { useMediaQuery } from '@/hooks';

interface ResponsiveGridProps {
  /** Grid items */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Number of columns on mobile */
  mobileColumns?: 1 | 2;
  /** Number of columns on tablet */
  tabletColumns?: 2 | 3 | 4;
  /** Number of columns on desktop */
  desktopColumns?: 3 | 4 | 5 | 6;
  /** Gap between grid items */
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * A responsive grid component
 */
export function ResponsiveGrid({
  children,
  className,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 'md',
}: ResponsiveGridProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  // Determine the number of columns based on screen size
  const columns = isMobile ? mobileColumns : isTablet ? tabletColumns : desktopColumns;

  // Map columns to Tailwind classes
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  // Map gap to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div
      className={classNames(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      data-testid="responsive-grid"
    >
      {children}
    </div>
  );
}
