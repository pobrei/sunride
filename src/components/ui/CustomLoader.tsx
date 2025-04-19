'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrainLoader } from './TrainLoader';
import '@/styles/custom-loader.css';

interface CustomLoaderProps {
  /** Optional message to display */
  message?: string;
  /** Optional className for styling */
  className?: string;
  /** Whether to center the loader */
  centered?: boolean;
  /** Whether to show a full-page overlay */
  fullPage?: boolean;
  /** Accessibility label (defaults to message or 'Loading') */
  ariaLabel?: string;
  /** Size of the loader */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * A custom train loader animation component
 */
export function CustomLoader({
  message,
  className,
  centered = false,
  fullPage = false,
  ariaLabel,
  size = 'md',
}: CustomLoaderProps) {
  // Determine the accessibility label
  const accessibilityLabel = ariaLabel || message || 'Loading';

  // Create the loader content
  const loaderContent = (
    <TrainLoader
      size={size}
      message={message}
      className={className}
      centered={centered}
      ariaLabel={accessibilityLabel}
    />
  );

  if (fullPage) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={accessibilityLabel}
      >
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}
