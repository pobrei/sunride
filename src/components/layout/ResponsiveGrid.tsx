'use client';

/**
 * ResponsiveGrid Component
 *
 * This component provides a responsive grid layout
 * following iOS 19 design principles.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useGridColumns, useSpacing, GridColumns, SpacingSize } from '@/lib/responsive-utils';

export interface ResponsiveGridProps {
  /** Children components */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Number of columns on mobile (default: 1) */
  mobileColumns?: GridColumns;
  /** Number of columns on tablet (default: 2) */
  tabletColumns?: GridColumns;
  /** Number of columns on desktop (default: 3) */
  desktopColumns?: GridColumns;
  /** Number of columns on large desktop (default: 4) */
  largeDesktopColumns?: GridColumns;
  /** Gap between items (default: 'md') */
  gap?: SpacingSize | { xs?: SpacingSize; sm?: SpacingSize; md?: SpacingSize; lg?: SpacingSize; xl?: SpacingSize; '2xl'?: SpacingSize; };
  /** Row gap between grid items */
  rowGap?: SpacingSize | { xs?: SpacingSize; sm?: SpacingSize; md?: SpacingSize; lg?: SpacingSize; xl?: SpacingSize; '2xl'?: SpacingSize; };
  /** Column gap between grid items */
  columnGap?: SpacingSize | { xs?: SpacingSize; sm?: SpacingSize; md?: SpacingSize; lg?: SpacingSize; xl?: SpacingSize; '2xl'?: SpacingSize; };
  /** Whether to use auto-fit instead of fixed columns */
  autoFit?: boolean;
  /** Minimum width for auto-fit columns */
  minItemWidth?: string;
  /** Whether to use auto rows */
  autoRows?: boolean;
  /** Whether to use auto columns */
  autoColumns?: boolean;
  /** Whether to use auto flow */
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  /** Whether to use glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Whether to use equal height for all grid items */
  equalHeight?: boolean;
  /** Additional styles */
  style?: React.CSSProperties;
  /** HTML tag to use */
  as?: React.ElementType;
  /** ID for the grid */
  id?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** ARIA labelledby */
  ariaLabelledby?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
  /** ARIA role */
  role?: string;
  /** Data attributes */
  data?: Record<string, string>;
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
  rowGap,
  columnGap,
  autoFit = false,
  minItemWidth = '250px',
  autoRows = false,
  autoColumns = false,
  autoFlow,
  glass = false,
  bordered = false,
  shadowed = false,
  rounded = false,
  equalHeight = false,
  style,
  as: Component = 'div',
  id,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  role,
  data,
}: ResponsiveGridProps) {
  // Get spacing for gap
  const gridGap = useSpacing(gap);
  const gridRowGap = rowGap ? useSpacing(rowGap) : undefined;
  const gridColumnGap = columnGap ? useSpacing(columnGap) : undefined;

  // Generate data attributes
  const dataAttributes: Record<string, string> = {};
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      dataAttributes[`data-${key}`] = value;
    });
  }

  // Get grid template columns
  const getGridTemplateColumns = () => {
    if (autoFit) {
      return `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`;
    }

    return `repeat(${mobileColumns}, minmax(0, 1fr))`;
  };

  return (
    <Component
      id={id}
      className={cn(
        'grid',
        glass && 'bg-background/80 backdrop-blur-sm',
        bordered && 'border border-border/20',
        shadowed && 'shadow-sm',
        rounded && 'rounded-lg',
        equalHeight && '[&>*]:h-full',
        className
      )}
      style={{
        gridTemplateColumns: getGridTemplateColumns(),
        gap: gridGap,
        rowGap: gridRowGap,
        columnGap: gridColumnGap,
        gridAutoRows: autoRows ? 'auto' : undefined,
        gridAutoColumns: autoColumns ? 'auto' : undefined,
        gridAutoFlow: autoFlow,
        ...style,
      }}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      role={role}
      {...dataAttributes}
    >
      {children}

      {!autoFit && (
        <style jsx global>{`
          @media (min-width: 640px) {
            #${id || ''}.grid,
            .grid${id ? `[id="${id}"]` : ''} {
              grid-template-columns: repeat(${tabletColumns}, minmax(0, 1fr));
            }
          }

          @media (min-width: 1024px) {
            #${id || ''}.grid,
            .grid${id ? `[id="${id}"]` : ''} {
              grid-template-columns: repeat(${desktopColumns}, minmax(0, 1fr));
            }
          }

          @media (min-width: 1280px) {
            #${id || ''}.grid,
            .grid${id ? `[id="${id}"]` : ''} {
              grid-template-columns: repeat(${largeDesktopColumns}, minmax(0, 1fr));
            }
          }
        `}</style>
      )}
    </Component>
  );
}

export default ResponsiveGrid;
