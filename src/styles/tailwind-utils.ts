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
 * Using Inter font with a clean, modern hierarchy
 */
export const typography = {
  // Headings
  h1: 'text-3xl font-semibold leading-tight tracking-tight text-foreground',
  h2: 'text-2xl font-semibold leading-tight tracking-tight text-foreground',
  h3: 'text-xl font-semibold leading-snug text-foreground',
  h4: 'text-lg font-semibold leading-snug text-foreground',
  h5: 'text-base font-semibold leading-normal text-foreground',
  h6: 'text-sm font-semibold leading-normal text-foreground',

  // Body text
  body: 'text-base text-foreground/90 leading-relaxed',
  bodyLg: 'text-lg text-foreground/90 leading-relaxed',
  bodySm: 'text-sm text-foreground/90 leading-relaxed',
  bodyXs: 'text-xs text-foreground/90 leading-normal',

  // Display text (larger than headings, for hero sections)
  display1: 'text-5xl font-bold tracking-tight leading-none text-foreground',
  display2: 'text-4xl font-bold tracking-tight leading-none text-foreground',

  // Text styles
  muted: 'text-muted-foreground',
  subtle: 'text-foreground/70',
  strong: 'font-semibold',
  emphasis: 'italic',
  underline: 'underline underline-offset-4',
  strike: 'line-through',

  // Interactive text
  link: 'text-primary hover:underline hover:text-primary/80 transition-colors',
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
  sectionTitle: 'text-xl font-semibold mb-4 text-foreground',
  cardTitle: 'text-lg font-semibold leading-none text-foreground',
  cardDescription: 'text-sm font-medium text-muted-foreground',
  formLabel: 'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  formDescription: 'text-sm text-muted-foreground',
  formMessage: 'text-sm font-medium text-destructive',
  breadcrumb: 'text-sm text-muted-foreground hover:text-foreground',
  caption: 'text-xs text-muted-foreground',
  badge: 'text-xs font-medium',
  code: 'font-mono text-sm bg-muted/50 px-1.5 py-0.5 rounded',
  blockquote: 'pl-4 border-l-2 border-muted italic text-muted-foreground',
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
  container: 'max-w-7xl mx-auto px-4',
  containerSm: 'max-w-3xl mx-auto px-4',
  containerLg: 'max-w-screen-2xl mx-auto px-4',
  containerFull: 'w-full px-4',

  // Section layouts
  section: 'py-8',
  sectionSm: 'py-4',
  sectionLg: 'py-16',
  sectionDivider: 'border-t border-border my-8',

  // Card layouts - Modern Design
  card: 'bg-card rounded-lg border border-border p-4 space-y-4 shadow-sm',
  cardHoverable: 'bg-card rounded-lg border border-border p-4 space-y-4 shadow-sm hover:shadow-md transition-all duration-200',
  cardInteractive: 'bg-card rounded-lg border border-border p-4 space-y-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200',
  cardCompact: 'bg-card rounded-lg border border-border p-3 space-y-2 shadow-sm',
  cardHeader: 'flex items-center justify-between mb-4',
  cardTitle: 'text-lg font-semibold text-foreground',
  cardDescription: 'text-sm text-muted-foreground',
  cardContent: 'space-y-4',
  cardFooter: 'flex items-center justify-between pt-4 mt-4',
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
  grid: 'grid grid-cols-1 gap-4',
  gridSm: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  gridMd: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4',
  gridLg: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  gridAuto: 'grid grid-cols-auto-fill-100 gap-4',
  gridAutoSm: 'grid grid-cols-auto-fill-200 gap-4',
  gridAutoMd: 'grid grid-cols-auto-fill-300 gap-4',

  // Form layouts
  formGroup: 'space-y-4 mb-4',
  formRow: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4',
  formLabel: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2',
  formDescription: 'text-sm text-muted-foreground mt-2',
  formMessage: 'text-sm font-medium text-destructive mt-2',
  formActions: 'flex justify-end space-x-4 mt-8',

  // Spacing utilities
  spacer: 'h-8',
  spacerSm: 'h-4',
  spacerLg: 'h-16',
  divider: 'border-t border-border my-8',
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
  responsiveGrid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4',
  responsiveGridCompact: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  responsiveGridWide: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',

  // Special layouts
  dashboardLayout: 'grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-screen',
  appLayout: 'flex flex-col min-h-screen',
  mainContent: 'flex-grow py-8',
  sidebarLayout: 'flex flex-col md:flex-row gap-4',
  sidebar: 'w-full md:w-64 shrink-0',
  content: 'flex-grow',
};

/**
 * Animation system - Modern Design with subtle animations
 */
export const animation = {
  // Basic animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideInFromRight: 'animate-slide-in-from-right',
  slideInFromLeft: 'animate-slide-in-from-left',
  slideInFromTop: 'animate-slide-in-from-top',
  slideInFromBottom: 'animate-slide-in-from-bottom',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  shimmer: 'animate-shimmer',
  progress: 'animate-indeterminate-progress',

  // Transition utilities
  transition: 'transition-all duration-200',
  transitionSlow: 'transition-all duration-300',
  transitionFast: 'transition-all duration-150',
  transitionColor: 'transition-colors duration-200',
  transitionOpacity: 'transition-opacity duration-200',
  transitionTransform: 'transition-transform duration-200',
  transitionScale: 'transition-transform duration-150',

  // Hover animations
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverScaleSm: 'hover:scale-102 transition-transform duration-200',
  hoverLift: 'hover:-translate-y-1 transition-transform duration-200',
  hoverLiftSm: 'hover:-translate-y-0.5 transition-transform duration-200',

  // Click/active animations
  clickScale: 'active:scale-95 transition-transform duration-150',
  clickScaleSm: 'active:scale-98 transition-transform duration-150',

  // Combined animations
  buttonPress: 'hover:scale-102 active:scale-98 transition-transform duration-150',
  cardHover: 'hover:shadow-md transition-all duration-200',
  linkHover: 'hover:underline hover:text-primary/80 transition-colors duration-200',
  fadeInSlideUp: 'animate-fade-in motion-safe:animate-slide-in-from-bottom',

  // Attention grabbing - removed for flat design
  pulse3Times: '',
  wiggle: '',
  flash: '',
  shake: '',
};

/**
 * Effect system - Modern Design with subtle effects
 */
export const effects = {
  // Interactive states
  hover: 'hover:bg-muted/50 transition-colors',
  hoverSubtle: 'hover:bg-muted/30 transition-colors',
  hoverPrimary: 'hover:bg-primary/90 transition-colors',
  hoverSecondary: 'hover:bg-secondary/90 transition-colors',
  active: 'active:scale-[0.98] transition-transform',
  activeSubtle: 'active:bg-muted/50 transition-colors',
  focus: 'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background',
  focusWithin: 'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/40',
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',

  // Shadows
  shadow: 'shadow-sm',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  shadowXl: 'shadow-xl',
  shadowInner: 'shadow-inner',
  shadowNone: 'shadow-none',

  // Visual effects - removed for flat design
  glassmorphism: '',
  glassmorphismDark: '',
  glassmorphismLight: '',
  frost: '',

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
  rounded: 'rounded',
  roundedSm: 'rounded-sm',
  roundedLg: 'rounded-lg',
  roundedXl: 'rounded-xl',
  rounded2xl: 'rounded-2xl',
  roundedFull: 'rounded-full',
  roundedNone: 'rounded-none',

  // Special effects
  elevate: 'shadow-md',
  elevateOnHover: 'hover:shadow-md transition-all duration-200',
  depressed: 'shadow-inner',
  outlined: 'border border-border rounded-md',
  outlinedPrimary: 'border border-primary/50 rounded-md',
  outlinedAccent: 'border border-accent/50 rounded-md',

  // Combinations
  card: 'bg-card rounded-lg border border-border shadow-sm',
  cardHoverable: 'bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200',
  cardInteractive: 'bg-card rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-all duration-200',
  cardInner: 'p-4 bg-background/50 border border-border/50 rounded-md',
  button: 'border border-border rounded-md transition-colors',
  buttonHover: 'hover:bg-muted/50 active:scale-[0.98] transition-all duration-200',
  input: 'border border-input bg-transparent rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20',
  pill: 'border px-3 py-1 text-xs font-medium rounded-full',
};

/**
 * Responsive utilities for consistent responsive design
 */
export const responsive = {
  // Visibility utilities
  hiddenSm: 'hidden sm:block',
  hiddenMd: 'hidden md:block',
  hiddenLg: 'hidden lg:block',
  hiddenXl: 'hidden xl:block',

  visibleSm: 'sm:hidden',
  visibleMd: 'md:hidden',
  visibleLg: 'lg:hidden',
  visibleXl: 'xl:hidden',

  // Flex direction utilities
  stackCol: 'flex flex-col',
  stackRow: 'flex flex-col sm:flex-row',
  stackRowMd: 'flex flex-col md:flex-row',
  stackRowLg: 'flex flex-col lg:flex-row',

  // Flex wrap utilities
  wrapSm: 'flex-wrap sm:flex-nowrap',
  wrapMd: 'flex-wrap md:flex-nowrap',

  // Mobile-first width utilities
  mobileFullWidth: 'w-full min-w-full',
  mobileContainer: 'w-full px-4 sm:px-6 md:px-8',

  // Scrollable container utilities
  scrollContainer: 'overflow-x-auto overflow-y-hidden snap-x scroll-smooth px-2 pb-2',
  scrollItem: 'min-w-[300px] flex-shrink-0 snap-center',
  scrollItemSm: 'min-w-[200px] flex-shrink-0 snap-center',
  scrollItemLg: 'min-w-[400px] flex-shrink-0 snap-center',

  // Chart and map container utilities
  chartContainer: 'h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] w-full max-w-full overflow-visible mb-4',
  mapContainer: 'h-[300px] sm:h-[400px] md:h-[500px] w-full overflow-hidden',

  // Timeline utilities
  timelineItem: 'min-w-[180px] flex-shrink-0 snap-center',

  // Spacing utilities for mobile
  mobileSpacing: 'p-3 sm:p-4 md:p-6',
  mobileGap: 'gap-3 sm:gap-4 md:gap-6',
  mobileMargin: 'mb-4 sm:mb-6 md:mb-8'
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

  // Badge variants - simplified for flat design
  badgeSuccess: 'bg-success/10 text-success text-xs font-medium px-2 py-0.5',
  badgeError: 'bg-destructive/10 text-destructive text-xs font-medium px-2 py-0.5',
  badgeWarning: 'bg-warning/10 text-warning text-xs font-medium px-2 py-0.5',
  badgeInfo: 'bg-info/10 text-info text-xs font-medium px-2 py-0.5',
  badgeNeutral: 'bg-muted-foreground/10 text-muted-foreground text-xs font-medium px-2 py-0.5',

  // Solid badge variants - simplified for flat design
  badgeSuccessSolid: 'bg-success text-success-foreground text-xs font-medium px-2 py-0.5',
  badgeErrorSolid: 'bg-destructive text-destructive-foreground text-xs font-medium px-2 py-0.5',
  badgeWarningSolid: 'bg-warning text-warning-foreground text-xs font-medium px-2 py-0.5',
  badgeInfoSolid: 'bg-info text-info-foreground text-xs font-medium px-2 py-0.5',
  badgeNeutralSolid: 'bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5',

  // Outline badge variants - simplified for flat design
  badgeSuccessOutline: 'border border-success/50 text-success text-xs font-medium px-2 py-0.5',
  badgeErrorOutline: 'border border-destructive/50 text-destructive text-xs font-medium px-2 py-0.5',
  badgeWarningOutline: 'border border-warning/50 text-warning text-xs font-medium px-2 py-0.5',
  badgeInfoOutline: 'border border-info/50 text-info text-xs font-medium px-2 py-0.5',
  badgeNeutralOutline: 'border border-muted-foreground/50 text-muted-foreground text-xs font-medium px-2 py-0.5',

  // Alert variants - simplified for flat design
  alertSuccess: 'bg-success/10 text-success border-l-4 border-success p-4',
  alertError: 'bg-destructive/10 text-destructive border-l-4 border-destructive p-4',
  alertWarning: 'bg-warning/10 text-warning border-l-4 border-warning p-4',
  alertInfo: 'bg-info/10 text-info border-l-4 border-info p-4',
  alertNeutral: 'bg-muted-foreground/10 text-muted-foreground border-l-4 border-muted-foreground p-4',

  // Toast variants - simplified for flat design
  toastSuccess: 'bg-success/10 text-success border border-success/20',
  toastError: 'bg-destructive/10 text-destructive border border-destructive/20',
  toastWarning: 'bg-warning/10 text-warning border border-warning/20',
  toastInfo: 'bg-info/10 text-info border border-info/20',
  toastNeutral: 'bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20',

  // Status dot indicators - simplified for flat design
  dotSuccess: 'h-2 w-2 bg-success',
  dotError: 'h-2 w-2 bg-destructive',
  dotWarning: 'h-2 w-2 bg-warning',
  dotInfo: 'h-2 w-2 bg-info',
  dotNeutral: 'h-2 w-2 bg-muted-foreground',

  // Status text
  textSuccess: 'text-success',
  textError: 'text-destructive',
  textWarning: 'text-warning',
  textInfo: 'text-info',
  textNeutral: 'text-muted-foreground',
};

/**
 * Loading system - Flat Design (minimal loading indicators)
 */
export const loading = {
  // Skeleton loaders - simplified for flat design
  skeleton: 'bg-muted/60 dark:bg-muted/40',
  skeletonText: 'bg-muted/60 dark:bg-muted/40 h-4 w-full',
  skeletonCircle: 'bg-muted/60 dark:bg-muted/40',
  skeletonButton: 'bg-muted/60 dark:bg-muted/40 h-9 w-24',
  skeletonImage: 'bg-muted/60 dark:bg-muted/40',
  skeletonCard: 'bg-muted/60 dark:bg-muted/40 border border-border',
  skeletonShimmer: '',

  // Spinners - keep for functional loading indicators
  spinner: 'animate-spin',
  spinnerSm: 'h-4 w-4 animate-spin',
  spinnerMd: 'h-6 w-6 animate-spin',
  spinnerLg: 'h-8 w-8 animate-spin',
  spinnerXl: 'h-12 w-12 animate-spin',

  // Progress indicators - simplified for flat design
  progress: 'h-1 w-full bg-primary/20 overflow-hidden',
  progressBar: 'h-full bg-primary',
  progressIndeterminate: 'h-1 w-full bg-primary/20 overflow-hidden relative',
  progressIndeterminateBar: 'absolute inset-0 bg-primary',

  // Dots loading - simplified for flat design
  dots: 'flex space-x-1',
  dot: 'h-2 w-2 bg-current',

  // Pulse effects - removed for flat design
  pulse: '',
  pulseSlow: '',
  pulseFast: '',

  // Loading overlays - simplified for flat design
  overlay: 'absolute inset-0 bg-background/80 flex items-center justify-center z-50',
  overlayDark: 'absolute inset-0 bg-background/90 flex items-center justify-center z-50',
  overlayLight: 'absolute inset-0 bg-background/50 flex items-center justify-center z-50',

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
