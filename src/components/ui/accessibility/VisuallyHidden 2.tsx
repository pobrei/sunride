'use client';

/**
 * Visually Hidden Component
 * 
 * This component hides content visually but keeps it accessible to screen readers.
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Visually hidden props
 */
export interface VisuallyHiddenProps {
  /** Children components */
  children: React.ReactNode;
  /** Whether to show the content when focused */
  showOnFocus?: boolean;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** HTML tag to use */
  as?: React.ElementType;
}

/**
 * Visually hidden component
 */
export function VisuallyHidden({
  children,
  showOnFocus = false,
  className,
  style,
  as: Component = 'span',
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        'sr-only',
        showOnFocus && 'focus:not-sr-only focus:absolute focus:p-2 focus:bg-background focus:text-foreground focus:z-50',
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
}

export default VisuallyHidden;
