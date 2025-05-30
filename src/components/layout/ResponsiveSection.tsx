'use client';

/**
 * ResponsiveSection Component
 * 
 * This component provides a responsive section layout
 * following iOS 19 design principles.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveSectionProps {
  /** Children components */
  children: React.ReactNode;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Additional class names */
  className?: string;
  /** Section padding */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Section margin */
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to use glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Whether to use full height */
  fullHeight?: boolean;
  /** Whether to show a divider */
  divider?: boolean;
  /** Whether to use a sticky header */
  stickyHeader?: boolean;
}

/**
 * A responsive section component that follows iOS 19 design principles
 */
export function ResponsiveSection({
  children,
  title,
  description,
  className,
  padding = 'md',
  margin = 'md',
  glass = false,
  bordered = false,
  shadowed = false,
  rounded = false,
  fullHeight = false,
  divider = false,
  stickyHeader = false,
}: ResponsiveSectionProps) {
  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Margin classes
  const marginClasses = {
    none: 'm-0',
    xs: 'my-2',
    sm: 'my-3',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  };

  return (
    <section
      className={cn(
        paddingClasses[padding],
        marginClasses[margin],
        fullHeight && 'h-full',
        glass && 'bg-white/50 dark:bg-card/50 backdrop-blur-sm',
        bordered && 'border border-border/20',
        shadowed && 'shadow-sm',
        rounded && 'rounded-xl',
        divider && 'border-b border-border/20 last:border-b-0',
        className
      )}
    >
      {title && (
        <div
          className={cn(
            'mb-4',
            stickyHeader && 'sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2'
          )}
        >
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default ResponsiveSection;
