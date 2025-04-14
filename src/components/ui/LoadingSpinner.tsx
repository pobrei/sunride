'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingVariant = 'spinner' | 'pulse' | 'skeleton' | 'dots';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: LoadingSize | number;
  /** Color of the spinner (Tailwind class) */
  color?: string;
  /** Optional message to display */
  message?: string;
  /** Optional className for styling */
  className?: string;
  /** Whether to center the spinner */
  centered?: boolean;
  /** Whether to show a full-page overlay */
  fullPage?: boolean;
  /** Loading variant style */
  variant?: LoadingVariant;
  /** Whether to show a card-like container */
  withContainer?: boolean;
  /** Icon to use (defaults to Loader2) */
  icon?: React.ReactNode;
  /** Whether to show a subtle background */
  withBackground?: boolean;
}

/**
 * A reusable loading spinner component with multiple variants
 */
export function LoadingSpinner({
  size = 'md',
  color = 'text-primary',
  message,
  className,
  centered = false,
  fullPage = false,
  variant = 'spinner',
  withContainer = false,
  icon,
  withBackground = false,
}: LoadingSpinnerProps) {
  // Convert size to pixels if it's a string
  const sizeInPx = typeof size === 'string'
    ? { sm: 16, md: 24, lg: 32, xl: 48 }[size] || 24
    : size;

  // Determine the icon based on variant and provided icon
  const loadingIcon = icon || <Loader2 className={cn('animate-spin', color)} size={sizeInPx} aria-hidden="true" />;

  // Create the spinner content based on variant
  let variantContent;
  switch (variant) {
    case 'pulse':
      variantContent = (
        <div className="flex items-center gap-2">
          <div className={cn(
            'rounded-full animate-pulse',
            color || 'bg-primary/20',
            { 'h-4 w-4': size === 'sm', 'h-6 w-6': size === 'md', 'h-8 w-8': size === 'lg', 'h-12 w-12': size === 'xl' }
          )} />
          {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
        </div>
      );
      break;

    case 'dots':
      variantContent = (
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full',
                color || 'bg-primary',
                { 'h-2 w-2': size === 'sm', 'h-3 w-3': size === 'md', 'h-4 w-4': size === 'lg', 'h-5 w-5': size === 'xl' },
                'animate-bounce',
                `animation-delay-${i}`
              )}
            />
          ))}
          {message && <p className="text-sm text-muted-foreground ml-2">{message}</p>}
        </div>
      );
      break;

    case 'skeleton':
      variantContent = (
        <div className="space-y-2 w-full">
          <div className={cn(
            'rounded animate-pulse',
            color || 'bg-muted',
            { 'h-4': size === 'sm', 'h-6': size === 'md', 'h-8': size === 'lg', 'h-10': size === 'xl' },
            'w-full'
          )} />
          {message && (
            <div className="rounded animate-pulse bg-muted h-4 w-2/3" />
          )}
        </div>
      );
      break;

    case 'spinner':
    default:
      variantContent = (
        <div className="flex items-center gap-2">
          {loadingIcon}
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      );
  }

  // Wrap the content
  const spinnerContent = (
    <div
      className={cn(
        'flex items-center',
        variant !== 'skeleton' && 'gap-2',
        centered && 'justify-center',
        withContainer && 'p-4 rounded-lg border border-border bg-card shadow-sm',
        withBackground && 'bg-background/50 backdrop-blur-sm p-3 rounded-md',
        className
      )}
      data-testid="loading-spinner"
      role="status"
      aria-live="polite"
    >
      {variantContent}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {withContainer ? spinnerContent : (
          <div className="p-6 rounded-xl bg-card shadow-lg">
            {spinnerContent}
          </div>
        )}
      </div>
    );
  }

  return spinnerContent;
}
