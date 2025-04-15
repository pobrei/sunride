'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AccessibleIconProps {
  /** The icon component to render */
  icon: React.ReactNode;
  /** The label for screen readers */
  label: string;
  /** Whether to hide the icon from screen readers */
  hideFromScreenReaders?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * A wrapper component that makes icons accessible by providing proper ARIA attributes
 */
export function AccessibleIcon({
  icon,
  label,
  hideFromScreenReaders = true,
  className,
}: AccessibleIconProps) {
  return (
    <span
      className={cn('inline-flex', className)}
      role="presentation"
      aria-hidden="true"
      aria-label={!hideFromScreenReaders ? label : undefined}
    >
      {icon}
      {hideFromScreenReaders && (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}
