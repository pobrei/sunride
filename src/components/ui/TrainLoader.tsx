'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import '@/styles/custom-loader.css';

type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

interface TrainLoaderProps {
  /** Size of the loader */
  size?: LoaderSize;
  /** Optional message to display */
  message?: string;
  /** Optional className for styling */
  className?: string;
  /** Whether to center the loader */
  centered?: boolean;
  /** Accessibility label (defaults to message or 'Loading') */
  ariaLabel?: string;
}

/**
 * A custom train-shaped loading animation
 */
export function TrainLoader({
  size = 'md',
  message,
  className,
  centered = false,
  ariaLabel,
}: TrainLoaderProps) {
  // Determine the accessibility label
  const accessibilityLabel = ariaLabel || message || 'Loading';

  // Determine size class
  const sizeClass = `custom-loader-${size}`;

  return (
    <div
      className={cn(
        'flex flex-col items-center',
        centered && 'justify-center',
        className
      )}
      data-testid="train-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={accessibilityLabel}
    >
      <div className="loader" />
      {message && (
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      )}
    </div>
  );
}
