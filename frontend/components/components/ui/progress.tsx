'use client';

import * as React from 'react';
import { classNames } from '@shared/utils/classNames';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The current value of the progress bar (0-100) */
  value?: number;
  /** Whether to show an indeterminate loading state */
  indeterminate?: boolean;
  /** Optional indicator color (Tailwind class) */
  indicatorColor?: string;
  /** Optional track color (Tailwind class) */
  trackColor?: string;
  /** Optional animation for the indicator */
  animation?: 'pulse' | 'none';
}

/**
 * A progress bar component that shows completion of a task
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      indeterminate = false,
      indicatorColor,
      trackColor,
      animation = 'none',
      ...props
    },
    ref
  ) => {
    // Ensure value is between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : clampedValue}
        className={classNames(
          'relative h-4 w-full overflow-hidden rounded-full',
          trackColor || 'bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className={classNames(
            'h-full flex-1 transition-all duration-300',
            indicatorColor || 'bg-primary',
            indeterminate && 'animate-indeterminate-progress',
            animation === 'pulse' && 'animate-pulse'
          )}
          style={{
            width: indeterminate ? '100%' : `${clampedValue}%`,
            transform: indeterminate ? 'translateX(-100%)' : undefined,
          }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
