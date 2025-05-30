'use client';

/**
 * ResponsiveContainer Component
 *
 * This component provides a responsive container for content
 * following iOS 19 design principles.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useContainerMaxWidth, useSpacing, ContainerSize, SpacingSize } from '@/lib/responsive-utils';

export interface ResponsiveContainerProps {
  /** Children components */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Container max width */
  maxWidth?: ContainerSize | { xs?: ContainerSize; sm?: ContainerSize; md?: ContainerSize; lg?: ContainerSize; xl?: ContainerSize; '2xl'?: ContainerSize; };
  /** Container padding */
  padding?: SpacingSize | { xs?: SpacingSize; sm?: SpacingSize; md?: SpacingSize; lg?: SpacingSize; xl?: SpacingSize; '2xl'?: SpacingSize; };
  /** Whether to center the container */
  centered?: boolean;
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
  /** HTML tag to use */
  as?: React.ElementType;
  /** ID for the container */
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
 * A responsive container component that follows iOS 19 design principles
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  centered = true,
  glass = false,
  bordered = false,
  shadowed = false,
  rounded = false,
  fullHeight = false,
  as: Component = 'div',
  id,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  role,
  data,
}: ResponsiveContainerProps) {
  // Get container max width
  const containerMaxWidth = useContainerMaxWidth(maxWidth);

  // Get container padding
  const containerPadding = useSpacing(padding);

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
        'w-full',
        centered && 'mx-auto',
        fullHeight && 'h-full',
        glass && 'bg-background/80 backdrop-blur-sm',
        bordered && 'border border-border/20',
        shadowed && 'shadow-sm',
        rounded && 'rounded-xl',
        className
      )}
      style={{
        maxWidth: containerMaxWidth,
        padding: containerPadding,
      }}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      role={role}
      {...dataAttributes}
    >
      {children}
    </Component>
  );
}

export default ResponsiveContainer;
