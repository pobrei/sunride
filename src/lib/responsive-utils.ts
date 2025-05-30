/**
 * Responsive utilities for container sizing and spacing
 */

import { useMemo } from 'react';

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Container max width mappings
const containerSizes: Record<ContainerSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

// Spacing mappings
const spacingSizes: Record<SpacingSize, string> = {
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
  '2xl': 'p-12',
};

/**
 * Hook to get container max width class
 */
export function useContainerMaxWidth(
  size: ContainerSize | { xs?: ContainerSize; sm?: ContainerSize; md?: ContainerSize; lg?: ContainerSize; xl?: ContainerSize; '2xl'?: ContainerSize; }
): string {
  return useMemo(() => {
    if (typeof size === 'string') {
      return containerSizes[size];
    }
    
    // Handle responsive object
    const classes: string[] = [];
    if (size.xs) classes.push(containerSizes[size.xs]);
    if (size.sm) classes.push(`sm:${containerSizes[size.sm]}`);
    if (size.md) classes.push(`md:${containerSizes[size.md]}`);
    if (size.lg) classes.push(`lg:${containerSizes[size.lg]}`);
    if (size.xl) classes.push(`xl:${containerSizes[size.xl]}`);
    if (size['2xl']) classes.push(`2xl:${containerSizes[size['2xl']]}`);
    
    return classes.join(' ');
  }, [size]);
}

/**
 * Hook to get spacing class
 */
export function useSpacing(
  size: SpacingSize | { xs?: SpacingSize; sm?: SpacingSize; md?: SpacingSize; lg?: SpacingSize; xl?: SpacingSize; '2xl'?: SpacingSize; }
): string {
  return useMemo(() => {
    if (typeof size === 'string') {
      return spacingSizes[size];
    }
    
    // Handle responsive object
    const classes: string[] = [];
    if (size.xs) classes.push(spacingSizes[size.xs]);
    if (size.sm) classes.push(`sm:${spacingSizes[size.sm]}`);
    if (size.md) classes.push(`md:${spacingSizes[size.md]}`);
    if (size.lg) classes.push(`lg:${spacingSizes[size.lg]}`);
    if (size.xl) classes.push(`xl:${spacingSizes[size.xl]}`);
    if (size['2xl']) classes.push(`2xl:${spacingSizes[size['2xl']]}`);
    
    return classes.join(' ');
  }, [size]);
}
