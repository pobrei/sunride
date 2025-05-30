'use client';

/**
 * Grid Section Component
 * 
 * This component provides a grid section that adapts to different screen sizes.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useGridColumnSpan, GridColumnSpan } from '@/lib/responsive-utils';

/**
 * Grid section props
 */
export interface GridSectionProps {
  /** Children components */
  children: React.ReactNode;
  /** Column span for different screen sizes */
  colSpan?: GridColumnSpan | { xs?: GridColumnSpan; sm?: GridColumnSpan; md?: GridColumnSpan; lg?: GridColumnSpan; xl?: GridColumnSpan; '2xl'?: GridColumnSpan; };
  /** Row span for different screen sizes */
  rowSpan?: GridColumnSpan | { xs?: GridColumnSpan; sm?: GridColumnSpan; md?: GridColumnSpan; lg?: GridColumnSpan; xl?: GridColumnSpan; '2xl'?: GridColumnSpan; };
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Whether to use glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Whether to use padding */
  padding?: boolean;
  /** Whether to use a sticky header */
  stickyHeader?: boolean;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** HTML tag to use */
  as?: React.ElementType;
  /** ID for the section */
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
 * Grid section component
 */
export function GridSection({
  children,
  colSpan,
  rowSpan,
  title,
  description,
  glass = false,
  bordered = false,
  shadowed = false,
  rounded = false,
  padding = false,
  stickyHeader = false,
  className,
  style,
  as: Component = 'div',
  id,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  role,
  data,
}: GridSectionProps) {
  // Get column span
  const gridColumnSpan = useGridColumnSpan(colSpan || 1);
  
  // Get row span
  const gridRowSpan = useGridColumnSpan(rowSpan || 1);
  
  // Generate data attributes
  const dataAttributes: Record<string, string> = {};
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      dataAttributes[`data-${key}`] = value;
    });
  }
  
  return (
    <Component
      id={id}
      className={cn(
        glass && 'bg-background/80 backdrop-blur-sm',
        bordered && 'border border-border/20',
        shadowed && 'shadow-sm',
        rounded && 'rounded-lg',
        padding && 'p-4',
        className
      )}
      style={{
        gridColumn: gridColumnSpan,
        gridRow: gridRowSpan,
        ...style,
      }}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      role={role}
      {...dataAttributes}
    >
      {(title || description) && (
        <div
          className={cn(
            'mb-4',
            stickyHeader && 'sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2'
          )}
        >
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </Component>
  );
}

export default GridSection;
