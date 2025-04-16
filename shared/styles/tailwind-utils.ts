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
 * Typography system for consistent text styling across the application
 */
export const typography = {
  // Headings
  h1: 'text-4xl font-bold tracking-tight leading-tight',
  h2: 'text-3xl font-bold tracking-tight leading-tight',
  h3: 'text-2xl font-bold leading-snug',
  h4: 'text-xl font-semibold leading-snug',
  h5: 'text-lg font-semibold leading-snug',
  h6: 'text-base font-semibold leading-normal',

  // Body text - updated to match new typography system
  body: 'text-lg leading-relaxed',  // Main body text
  bodyLg: 'text-xl leading-relaxed',
  bodySm: 'text-sm leading-normal', // For labels
  bodyXs: 'text-xs leading-normal',

  // Display text (larger than headings, for hero sections)
  display1: 'text-6xl font-bold tracking-tighter leading-none',
  display2: 'text-5xl font-bold tracking-tight leading-none',

  // Text styles
  muted: 'text-muted-foreground',
  subtle: 'text-foreground/70',
  strong: 'font-semibold',
  emphasis: 'italic',
  underline: 'underline underline-offset-4',
  strike: 'line-through',

  // Interactive text
  link: 'text-primary hover:underline hover:text-primary-dark transition-colors',
  linkMuted: 'text-muted-foreground hover:text-foreground hover:underline transition-colors',
  linkSubtle: 'text-foreground/70 hover:text-foreground hover:underline transition-colors',

  // Alignment
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',

  // Truncation
  truncate: 'truncate',
  lineClamp1: 'line-clamp-1',
  lineClamp2: 'line-clamp-2',
  lineClamp3: 'line-clamp-3',

  // Semantic text
  error: 'text-destructive',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',

  // Combinations
  sectionTitle: 'text-2xl font-bold tracking-tight mb-4',
  cardTitle: 'text-lg font-semibold leading-none',
  cardDescription: 'text-sm text-muted-foreground',
  formLabel: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  formDescription: 'text-sm text-muted-foreground',
  formMessage: 'text-sm font-medium text-destructive',
  breadcrumb: 'text-sm text-muted-foreground hover:text-foreground',
  caption: 'text-xs text-muted-foreground',
  badge: 'text-xs font-medium',
  code: 'font-mono text-sm',
  blockquote: 'pl-4 border-l-2 border-muted italic text-muted-foreground',

  // New typography system classes
  textBody: 'text-lg leading-relaxed font-normal',
  textLabel: 'text-sm leading-normal font-normal',
};

/**
 * Font weight utilities
 */
export const fontWeight = {
  thin: 'font-thin', // 100
  extralight: 'font-extralight', // 200
  light: 'font-light', // 300
  normal: 'font-normal', // 400
  medium: 'font-medium', // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold', // 700
  extrabold: 'font-extrabold', // 800
  black: 'font-black', // 900
};

/**
 * Line height utilities
 */
export const lineHeight = {
  none: 'leading-none', // 1
  tight: 'leading-tight', // 1.25
  snug: 'leading-snug', // 1.375
  normal: 'leading-normal', // 1.5
  relaxed: 'leading-relaxed', // 1.625
  loose: 'leading-loose', // 2
};

/**
 * Layout system for consistent layout patterns across the application
 */
export const layout = {
  // Container layouts
  container: 'max-w-screen-xl mx-auto px-4',
  containerSm: 'mx-auto px-4 max-w-3xl',
  containerLg: 'mx-auto px-4 max-w-screen-2xl',
  containerFull: 'w-full px-4',

  // Grid layouts
  grid: 'grid grid-cols-12 gap-6',
  gridSm: 'grid grid-cols-12 gap-4',
  gridLg: 'grid grid-cols-12 gap-8',

  // Column spans
  colFull: 'col-span-12',
  colMain: 'col-span-12 md:col-span-8',
  colSidebar: 'col-span-12 md:col-span-4',
  colHalf: 'col-span-12 md:col-span-6',
  colThird: 'col-span-12 md:col-span-4',
  colTwoThirds: 'col-span-12 md:col-span-8',
  colQuarter: 'col-span-12 sm:col-span-6 md:col-span-3',

  // Section layouts
  section: 'py-12',
  sectionSm: 'py-6',
  sectionLg: 'py-24',
  sectionDivider: 'border-t border-border my-12',

  // Vertical spacing
  verticalSpacingSm: 'gap-4',
  verticalSpacingMd: 'gap-6',
  verticalSpacingLg: 'gap-8',

  // Section spacing
  sectionSpacing: 'mt-8 pb-12',

  // Card layouts
  card: 'bg-white dark:bg-[var(--color-card)] shadow-md rounded-2xl p-4 md:p-6 space-y-2 transition-all duration-200',
  cardHoverable: 'bg-white dark:bg-[var(--color-card)] shadow-md rounded-2xl p-4 md:p-6 space-y-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
  cardInteractive: 'bg-white dark:bg-[var(--color-card)] shadow-md rounded-2xl p-4 md:p-6 space-y-2 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-200',
  cardCompact: 'bg-white dark:bg-[var(--color-card)] shadow-md rounded-2xl p-3 space-y-1 transition-all duration-200',
  cardHeader: 'flex items-center justify-between',
  cardTitle: 'text-lg font-medium text-foreground',
  cardDescription: 'text-sm text-muted',
  cardContent: 'space-y-2',
  cardFooter: 'flex items-center justify-between pt-2 mt-2',
  cardOutline: 'border border-border dark:border-theme-border',
  cardFooterEnd: 'flex items-center justify-end pt-4 border-t border-border mt-4',

  // Flex layouts
  flexRow: 'flex flex-row items-center',
  flexCol: 'flex flex-col',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  flexWrap: 'flex flex-wrap',
  flexGrow: 'flex-grow',
  flexShrink: 'flex-shrink',

  // Grid layouts
  grid: 'grid grid-cols-1 gap-6',
  gridSm: 'grid grid-cols-1 sm:grid-cols-2 gap-6',
  gridMd: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6',
  gridLg: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
  gridAuto: 'grid grid-cols-auto-fill-100 gap-6',
  gridAutoSm: 'grid grid-cols-auto-fill-200 gap-6',
  gridAutoMd: 'grid grid-cols-auto-fill-300 gap-6',

  // Form layouts
  formGroup: 'space-y-2 mb-4',
  formRow: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4',
  formLabel: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2',
  formDescription: 'text-sm text-muted-foreground mt-1',
  formMessage: 'text-sm font-medium text-destructive mt-1',
  formActions: 'flex justify-end space-x-2 mt-6',

  // Spacing utilities
  spacer: 'h-6',
  spacerSm: 'h-3',
  spacerLg: 'h-12',
  divider: 'border-t border-border my-6',
  dividerVertical: 'border-l border-border mx-4 h-full',

  // Positioning utilities
  positionRelative: 'relative',
  positionAbsolute: 'absolute',
  positionFixed: 'fixed',
  positionSticky: 'sticky',
  positionStatic: 'static',

  // Z-index utilities
  zBase: 'z-0',
  zRaised: 'z-10',
  zDropdown: 'z-20',
  zSticky: 'z-30',
  zDrawer: 'z-40',
  zModal: 'z-50',
  zTooltip: 'z-60',
  zToast: 'z-70',
  zMax: 'z-[9999]',

  // Responsive layouts
  responsiveStack: 'flex flex-col md:flex-row',
  responsiveReverse: 'flex flex-col-reverse md:flex-row',
  responsiveHide: 'hidden md:block',
  responsiveShow: 'block md:hidden',

  // Special layouts
  dashboardLayout: 'grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-screen',
  appLayout: 'flex flex-col min-h-screen',
  mainContent: 'flex-grow py-6',
  sidebarLayout: 'flex flex-col md:flex-row gap-6',
  sidebar: 'w-full md:w-64 shrink-0',
  content: 'flex-grow',
};

/**
 * Animation system for consistent animations across the application
 */
export const animation = {
  // Basic animations
  fadeIn: 'opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]',
  fadeOut: 'opacity-100 animate-[fadeOut_0.3s_ease-in-out_forwards]',
  slideInFromRight: 'translate-x-full animate-[slideInFromRight_0.3s_ease-in-out_forwards]',
  slideInFromLeft: '-translate-x-full animate-[slideInFromLeft_0.3s_ease-in-out_forwards]',
  slideInFromTop: '-translate-y-full animate-[slideInFromTop_0.3s_ease-in-out_forwards]',
  slideInFromBottom: 'translate-y-full animate-[slideInFromBottom_0.3s_ease-in-out_forwards]',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  shimmer: 'animate-shimmer',
  progress: 'animate-indeterminate-progress',

  // Transition utilities
  transition: 'transition-all duration-200 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  transitionColor: 'transition-colors duration-200 ease-in-out',
  transitionOpacity: 'transition-opacity duration-200 ease-in-out',
  transitionTransform: 'transition-transform duration-200 ease-in-out',
  transitionScale: 'transition-transform duration-150 ease-out',

  // Hover animations
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverScaleSm: 'hover:scale-102 transition-transform duration-200',
  hoverLift: 'hover:-translate-y-1 transition-transform duration-200',
  hoverLiftSm: 'hover:-translate-y-0.5 transition-transform duration-200',

  // Click/active animations
  clickScale: 'active:scale-95 transition-transform duration-150',
  clickScaleSm: 'active:scale-98 transition-transform duration-150',

  // Combined animations
  buttonPress: 'active:scale-95 transition-transform duration-150',
  cardHover: 'hover:-translate-y-1 hover:shadow-md transition-all duration-200',
  linkHover: 'hover:underline hover:text-primary-dark transition-colors duration-200',
  fadeInSlideUp: 'opacity-0 translate-y-4 animate-[fadeIn_0.3s_ease-in-out_forwards]',

  // Attention grabbing
  pulse3Times: 'animate-[pulse_1s_ease-in-out_3]',
  wiggle: 'animate-[wiggle_0.5s_ease-in-out]',
  flash: 'animate-[flash_0.5s_ease-in-out]',
  shake: 'animate-[shake_0.5s_ease-in-out]',
};

/**
 * Effect system for consistent visual effects across the application
 */
export const effects = {
  // Interactive states
  hover: 'hover:bg-accent/10 hover:text-accent transition-colors duration-200',
  hoverSubtle: 'hover:bg-muted/50 transition-colors duration-200',
  hoverPrimary: 'hover:bg-primary-light hover:text-primary-foreground transition-colors duration-200',
  hoverSecondary: 'hover:bg-secondary-light hover:text-secondary-foreground transition-colors duration-200',
  active: 'active:scale-95 transition-transform duration-150',
  activeSubtle: 'active:scale-98 transition-transform duration-150',
  focus: 'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background',
  focusWithin: 'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2',
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',

  // Shadows
  shadow: 'shadow-sm',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  shadowXl: 'shadow-xl',
  shadowInner: 'shadow-inner',
  shadowNone: 'shadow-none',

  // Visual effects
  glassmorphism: 'bg-background/80 backdrop-blur-sm',
  glassmorphismDark: 'bg-background/90 backdrop-blur-md',
  glassmorphismLight: 'bg-background/60 backdrop-blur-sm',
  frost: 'bg-white/30 backdrop-blur-lg backdrop-saturate-150 backdrop-filter',

  // Borders
  border: 'border border-border',
  borderTop: 'border-t border-border',
  borderRight: 'border-r border-border',
  borderBottom: 'border-b border-border',
  borderLeft: 'border-l border-border',
  borderNone: 'border-0',
  borderDashed: 'border border-dashed border-border',
  borderPrimary: 'border border-primary/20',
  borderAccent: 'border border-accent/20',

  // Border radius
  rounded: 'rounded-md',
  roundedSm: 'rounded-sm',
  roundedLg: 'rounded-lg',
  roundedXl: 'rounded-xl',
  rounded2xl: 'rounded-2xl',
  roundedFull: 'rounded-full',
  roundedNone: 'rounded-none',

  // Special effects
  elevate: 'shadow-md hover:shadow-lg transition-shadow duration-200',
  elevateOnHover: 'hover:shadow-md transition-shadow duration-200',
  depressed: 'shadow-inner bg-muted/50',
  outlined: 'border-2 border-border',
  outlinedPrimary: 'border-2 border-primary/50',
  outlinedAccent: 'border-2 border-accent/50',

  // Combinations
  card: 'rounded-lg border border-border bg-card shadow-sm',
  cardHoverable: 'rounded-lg border border-border bg-card shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-200',
  cardInteractive: 'rounded-lg border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20 cursor-pointer transition-all duration-200',
  cardInner: 'p-4 rounded-md bg-background/50 border border-border/50',
  button: 'rounded-md shadow-sm hover:shadow transition-all duration-200 active:scale-95',
  buttonHover: 'hover:bg-accent/10 hover:text-accent transition-colors duration-200',
  input: 'rounded-md border border-input bg-transparent shadow-sm focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200',
  pill: 'rounded-full px-3 py-1 text-xs font-medium',
  hoverSubtle: 'hover:bg-muted/50',
  borderTop: 'border-t border-border',
  borderBottom: 'border-b border-border',
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
 * Status system for consistent status indicators across the application
 */
export const status = {
  // Basic status indicators
  success: 'bg-success/10 text-success border-success/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20',

  // Badge variants
  badgeSuccess: 'bg-success/10 text-success text-xs font-medium px-2 py-0.5 rounded-full',
  badgeError: 'bg-destructive/10 text-destructive text-xs font-medium px-2 py-0.5 rounded-full',
  badgeWarning: 'bg-warning/10 text-warning text-xs font-medium px-2 py-0.5 rounded-full',
  badgeInfo: 'bg-info/10 text-info text-xs font-medium px-2 py-0.5 rounded-full',
  badgeNeutral: 'bg-muted-foreground/10 text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full',

  // Solid badge variants
  badgeSuccessSolid: 'bg-success text-success-foreground text-xs font-medium px-2 py-0.5 rounded-full',
  badgeErrorSolid: 'bg-destructive text-destructive-foreground text-xs font-medium px-2 py-0.5 rounded-full',
  badgeWarningSolid: 'bg-warning text-warning-foreground text-xs font-medium px-2 py-0.5 rounded-full',
  badgeInfoSolid: 'bg-info text-info-foreground text-xs font-medium px-2 py-0.5 rounded-full',
  badgeNeutralSolid: 'bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full',

  // Outline badge variants
  badgeSuccessOutline: 'border border-success/50 text-success text-xs font-medium px-2 py-0.5 rounded-full',
  badgeErrorOutline: 'border border-destructive/50 text-destructive text-xs font-medium px-2 py-0.5 rounded-full',
  badgeWarningOutline: 'border border-warning/50 text-warning text-xs font-medium px-2 py-0.5 rounded-full',
  badgeInfoOutline: 'border border-info/50 text-info text-xs font-medium px-2 py-0.5 rounded-full',
  badgeNeutralOutline: 'border border-muted-foreground/50 text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full',

  // Alert variants
  alertSuccess: 'bg-success/10 text-success border-l-4 border-success p-4 rounded-md',
  alertError: 'bg-destructive/10 text-destructive border-l-4 border-destructive p-4 rounded-md',
  alertWarning: 'bg-warning/10 text-warning border-l-4 border-warning p-4 rounded-md',
  alertInfo: 'bg-info/10 text-info border-l-4 border-info p-4 rounded-md',
  alertNeutral: 'bg-muted-foreground/10 text-muted-foreground border-l-4 border-muted-foreground p-4 rounded-md',

  // Toast variants
  toastSuccess: 'bg-success/10 text-success border border-success/20 shadow-md rounded-md',
  toastError: 'bg-destructive/10 text-destructive border border-destructive/20 shadow-md rounded-md',
  toastWarning: 'bg-warning/10 text-warning border border-warning/20 shadow-md rounded-md',
  toastInfo: 'bg-info/10 text-info border border-info/20 shadow-md rounded-md',
  toastNeutral: 'bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20 shadow-md rounded-md',

  // Status dot indicators
  dotSuccess: 'h-2 w-2 rounded-full bg-success',
  dotError: 'h-2 w-2 rounded-full bg-destructive',
  dotWarning: 'h-2 w-2 rounded-full bg-warning',
  dotInfo: 'h-2 w-2 rounded-full bg-info',
  dotNeutral: 'h-2 w-2 rounded-full bg-muted-foreground',

  // Status text
  textSuccess: 'text-success',
  textError: 'text-destructive',
  textWarning: 'text-warning',
  textInfo: 'text-info',
  textNeutral: 'text-muted-foreground',
};

/**
 * Loading system for consistent loading indicators across the application
 */
export const loading = {
  // Skeleton loaders
  skeleton: 'animate-pulse bg-muted/60 dark:bg-muted/40 rounded',
  skeletonText: 'animate-pulse bg-muted/60 dark:bg-muted/40 rounded h-4 w-full',
  skeletonCircle: 'animate-pulse bg-muted/60 dark:bg-muted/40 rounded-full',
  skeletonButton: 'animate-pulse bg-muted/60 dark:bg-muted/40 rounded-md h-9 w-24',
  skeletonImage: 'animate-pulse bg-muted/60 dark:bg-muted/40 rounded-md',
  skeletonCard: 'animate-pulse bg-muted/60 dark:bg-muted/40 rounded-lg border border-border',
  skeletonShimmer: 'animate-shimmer bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent bg-[length:200%_100%] rounded',

  // Spinners
  spinner: 'animate-spin',
  spinnerSm: 'h-4 w-4 animate-spin',
  spinnerMd: 'h-6 w-6 animate-spin',
  spinnerLg: 'h-8 w-8 animate-spin',
  spinnerXl: 'h-12 w-12 animate-spin',

  // Progress indicators
  progress: 'animate-indeterminate-progress h-1 w-full bg-primary/20 overflow-hidden rounded-full',
  progressBar: 'h-full bg-primary rounded-full',
  progressIndeterminate: 'h-1 w-full bg-primary/20 overflow-hidden rounded-full relative',
  progressIndeterminateBar: 'absolute inset-0 bg-primary rounded-full animate-indeterminate-progress',

  // Dots loading
  dots: 'flex space-x-1',
  dot: 'h-2 w-2 bg-current rounded-full animate-pulse',

  // Pulse effects
  pulse: 'animate-pulse',
  pulseSlow: 'animate-[pulse_2s_ease-in-out_infinite]',
  pulseFast: 'animate-[pulse_0.5s_ease-in-out_infinite]',

  // Loading overlays
  overlay: 'absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50',
  overlayDark: 'absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50',
  overlayLight: 'absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50',

  // Loading containers
  container: 'flex flex-col items-center justify-center space-y-2 p-4',
  containerWithText: 'flex flex-col items-center justify-center space-y-2 p-4 text-center',

  // Loading text
  text: 'text-sm text-muted-foreground animate-pulse',
  textSm: 'text-xs text-muted-foreground animate-pulse',
  textLg: 'text-base text-muted-foreground animate-pulse',
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
