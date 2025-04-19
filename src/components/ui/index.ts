// Export all UI components
export * from './accordion';
export * from './alert';
export * from './badge';
export * from './breadcrumb';
export * from './button';
export * from './card';
export * from './dialog';
export * from './dropdown-menu';
export * from './input';
export * from './label';
// export * from './loading-spinner'; // Removed in favor of LoadingSpinner.tsx
export * from './progress-steps';
export * from './scroll-area';
export * from './select';
export * from './skeleton';
export * from './slider';
export * from './switch';
export * from './tabs';
export * from './tooltip';
export * from './toast';
export * from './toaster';
export * from './motion';
export * from './motion-card';
export * from './optimized-list';
export * from './page-transition';
export * from './responsive-image';
export * from './enhanced-theme-toggle';
// Import and re-export from use-toast to avoid naming conflicts
import { useToast as useToastHook } from './use-toast';
export { useToastHook };
export { EmptyState } from './EmptyState';
export { ErrorCard } from './ErrorCard';
export { ErrorMessage } from './ErrorMessage';
export { LazyLoad } from './LazyLoad';
export { LoadingCard } from './LoadingCard';
export { LoadingSkeleton } from './LoadingSkeleton';
export { LoadingSpinner } from './LoadingSpinner';
export { ResponsiveContainer } from './ResponsiveContainer';
export { ResponsiveGrid } from './ResponsiveGrid';
export { SkipToContent } from './SkipToContent';
export { FeedbackMessage } from './FeedbackMessage';
export { LoadingOverlay, FullPageLoadingOverlay } from './LoadingOverlay';
export { AccessibleIcon } from './AccessibleIcon';
export { KeyboardFocusOutline } from './KeyboardFocusOutline';
export { FormErrorMessage } from './FormErrorMessage';

// Import from simple-toast for backward compatibility
import {
  SimpleToast as Toast,
  SimpleToastDescription as ToastDescription,
  SimpleToastTitle as ToastTitle,
  SimpleToastViewport as ToastViewport,
  SimpleToastProvider as ToastProvider,
  simpleToast as toast,
} from './simple-toast';

export { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport, toast };
