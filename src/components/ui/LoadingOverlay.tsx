'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { effects, animation, status } from '@/styles/tailwind-utils';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Optional loading message */
  message?: string;
  /** Whether to use a transparent background */
  transparent?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Whether to show a spinner */
  showSpinner?: boolean;
  /** Size of the spinner */
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Children to render when not loading */
  children?: React.ReactNode;
}

/**
 * A loading overlay component that can be used to indicate loading state
 * with proper accessibility attributes
 */
export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  transparent = false,
  className,
  showSpinner = true,
  spinnerSize = 'md',
  children,
}: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        'relative',
        className
      )}
    >
      {children && <div className="opacity-50 pointer-events-none">{children}</div>}
      
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          transparent ? 'bg-background/30' : 'bg-background/80',
          effects.glassmorphism,
          animation.fadeIn
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
          {showSpinner && <LoadingSpinner size={spinnerSize} />}
          {message && (
            <p className="text-sm font-medium text-foreground">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A full page loading overlay
 */
export function FullPageLoadingOverlay({
  isLoading,
  message = 'Loading...',
  transparent = false,
}: Omit<LoadingOverlayProps, 'className' | 'children'>) {
  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        transparent ? 'bg-background/30' : 'bg-background/80',
        effects.glassmorphism,
        animation.fadeIn
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-base font-medium text-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
