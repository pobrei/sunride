/**
 * Tailwind CSS utility functions and constants
 * This file provides consistent styling patterns across the application
 */

import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and resolves Tailwind conflicts
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Spacing constants for consistent spacing throughout the app
 */
export const spacing = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12',
  
  // Margin variants
  mxs: 'm-1',
  msm: 'm-2',
  mmd: 'm-4',
  mlg: 'm-6',
  mxl: 'm-8',
  m2xl: 'm-12',
  
  // Padding X/Y variants
  pxs: 'px-1 py-0.5',
  psm: 'px-2 py-1',
  pmd: 'px-4 py-2',
  plg: 'px-6 py-3',
  pxl: 'px-8 py-4',
  p2xl: 'px-12 py-6',
};

/**
 * Typography constants for consistent text styling
 */
export const typography = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight',
  h3: 'text-2xl font-bold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
  p: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs',
  muted: 'text-muted-foreground',
};

/**
 * Layout constants for consistent layout patterns
 */
export const layout = {
  card: 'rounded-lg border border-border bg-card shadow-sm p-4',
  cardHeader: 'pb-2 space-y-1.5',
  cardTitle: 'text-lg font-semibold',
  cardDescription: 'text-sm text-muted-foreground',
  cardContent: 'py-2',
  cardFooter: 'flex justify-end pt-2',
  
  section: 'py-6',
  container: 'container mx-auto px-4 max-w-7xl',
  
  flexRow: 'flex flex-row items-center',
  flexCol: 'flex flex-col',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexEnd: 'flex items-center justify-end',
  
  grid: 'grid grid-cols-1 gap-4',
  gridSm: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  gridMd: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4',
  gridLg: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
};

/**
 * Animation constants for consistent animations
 */
export const animation = {
  fadeIn: 'animate-fade-in',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  
  // Transition utilities
  transition: 'transition-all duration-200 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
};

/**
 * Effect constants for consistent visual effects
 */
export const effects = {
  hover: 'hover:bg-accent hover:text-accent-foreground',
  active: 'active:scale-95',
  focus: 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  
  shadow: 'shadow-sm',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  
  glassmorphism: 'bg-background/80 backdrop-blur-sm',
  border: 'border border-border',
  rounded: 'rounded-md',
  roundedLg: 'rounded-lg',
  roundedFull: 'rounded-full',
};

/**
 * Responsive utilities for consistent responsive design
 */
export const responsive = {
  hiddenSm: 'hidden sm:block',
  hiddenMd: 'hidden md:block',
  hiddenLg: 'hidden lg:block',
  hiddenXl: 'hidden xl:block',
  
  visibleSm: 'sm:hidden',
  visibleMd: 'md:hidden',
  visibleLg: 'lg:hidden',
  visibleXl: 'xl:hidden',
  
  stackCol: 'flex flex-col',
  stackRow: 'flex flex-col sm:flex-row',
  
  wrapSm: 'flex-wrap sm:flex-nowrap',
  wrapMd: 'flex-wrap md:flex-nowrap',
};

/**
 * Status colors for consistent status indicators
 */
export const status = {
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  neutral: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

/**
 * Loading state utilities for consistent loading indicators
 */
export const loading = {
  skeleton: 'animate-pulse bg-muted rounded',
  spinner: 'animate-spin',
  dots: 'animate-pulse',
  progress: 'animate-progress',
};

/**
 * Combines multiple Tailwind classes for a specific component type
 * @param baseClasses - Base classes to always include
 * @param conditionalClasses - Object with conditional classes
 * @returns Combined class string
 */
export function componentClasses(
  baseClasses: string,
  conditionalClasses: Record<string, boolean | undefined>
): string {
  return cn(
    baseClasses,
    Object.entries(conditionalClasses)
      .filter(([_, condition]) => condition)
      .map(([className]) => className)
      .join(' ')
  );
}
