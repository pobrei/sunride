'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typography, animation, effects, loading, layout } from '@/styles/tailwind-utils';
import { TrainLoader } from './TrainLoader';
import '@/styles/custom-loader.css';

type LoadingVariant = 'spinner' | 'pulse' | 'skeleton' | 'dots' | 'train';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: LoadingSize | number;
  /** Color of the spinner (Tailwind class) */
  color?: string;
  /** Optional message to display */
  message?: string;
  /** Accessibility label (defaults to message or 'Loading') */
  ariaLabel?: string;
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
  variant = 'train',
  withContainer = false,
  icon,
  withBackground = false,
  ariaLabel,
}: LoadingSpinnerProps) {
  // Convert size to pixels if it's a string
  const sizeInPx = typeof size === 'string' ? { sm: 16, md: 24, lg: 32, xl: 48 }[size] || 24 : size;

  // Determine the icon based on variant and provided icon
  const loadingIcon = icon || (
    <Loader2 className={cn(animation.spin, color)} size={sizeInPx} aria-hidden="true" />
  );

  // Determine the accessibility label
  const accessibilityLabel = ariaLabel || message || 'Loading';

  // Create the spinner content based on variant
  let variantContent;
  switch (variant) {
    case 'train':
      variantContent = (
        <TrainLoader
          size={typeof size === 'string' ? size : 'md'}
          message={message}
          ariaLabel={accessibilityLabel}
        />
      );
      break;
    case 'pulse':
      variantContent = (
        <div className="flex items-center gap-2">
          <div
            className={cn(animation.pulse, 'rounded-full', color || 'bg-primary/20', {
              'h-4 w-4': size === 'sm',
              'h-6 w-6': size === 'md',
              'h-8 w-8': size === 'lg',
              'h-12 w-12': size === 'xl',
            })}
          />
          {message && <p className={cn(typography.bodySm, typography.muted, animation.pulse)}>{message}</p>}
        </div>
      );
      break;

    case 'dots':
      variantContent = (
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                'rounded-full',
                color || 'bg-primary',
                {
                  'h-2 w-2': size === 'sm',
                  'h-3 w-3': size === 'md',
                  'h-4 w-4': size === 'lg',
                  'h-5 w-5': size === 'xl',
                },
                animation.bounce,
                `animation-delay-${i}`
              )}
            />
          ))}
          {message && <p className={cn(typography.bodySm, typography.muted, "ml-2")}>{message}</p>}
        </div>
      );
      break;

    case 'skeleton':
      variantContent = (
        <div className="space-y-2 w-full">
          <div
            className={cn(
              'rounded', animation.pulse,
              color || 'bg-muted',
              {
                'h-4': size === 'sm',
                'h-6': size === 'md',
                'h-8': size === 'lg',
                'h-10': size === 'xl',
              },
              'w-full'
            )}
          />
          {message && <div className={cn('rounded bg-muted h-4 w-2/3', animation.pulse)} />}
        </div>
      );
      break;

    case 'spinner':
    default:
      variantContent = (
        <div className="flex items-center gap-2">
          {loadingIcon}
          {message && <p className={cn(typography.bodySm, typography.muted)}>{message}</p>}
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
        withContainer && cn(effects.card, 'p-4'),
        withBackground && cn(effects.glassmorphismLight, 'p-3 rounded-md'),
        className
      )}
      data-testid="loading-spinner"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={accessibilityLabel}
    >
      {variantContent}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className={cn(loading.overlay, 'fixed inset-0 z-50')}
        role="dialog"
        aria-modal="true"
        aria-label={accessibilityLabel}
      >
        {withContainer ? (
          spinnerContent
        ) : (
          <div className={cn(effects.card, 'p-6 rounded-xl')}>{spinnerContent}</div>
        )}
      </div>
    );
  }

  return spinnerContent;
}
