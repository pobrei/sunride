'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@shared/lib/utils';

const statusIndicatorVariants = cva(
  'inline-flex rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-foreground',
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        destructive: 'bg-destructive',
        success: 'bg-success',
        warning: 'bg-warning',
        info: 'bg-info',
        muted: 'bg-muted-foreground',
      },
      size: {
        sm: 'h-1.5 w-1.5',
        default: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        blink: 'animate-[pulse_1s_ease-in-out_infinite]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusIndicatorVariants> {
  /**
   * Optional label for the status indicator
   */
  label?: string;
  /**
   * Whether to show the label
   */
  showLabel?: boolean;
  /**
   * Position of the label
   */
  labelPosition?: 'left' | 'right';
}

/**
 * Status indicator component for displaying status dots
 */
const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    label,
    showLabel = false,
    labelPosition = 'right',
    ...props 
  }, ref) => {
    return (
      <span className="inline-flex items-center gap-1.5" ref={ref} {...props}>
        {showLabel && label && labelPosition === 'left' && (
          <span className="text-xs font-medium">{label}</span>
        )}
        <span className={cn(statusIndicatorVariants({ variant, size, animation }), className)} />
        {showLabel && label && labelPosition === 'right' && (
          <span className="text-xs font-medium">{label}</span>
        )}
      </span>
    );
  }
);
StatusIndicator.displayName = 'StatusIndicator';

export { StatusIndicator, statusIndicatorVariants };
