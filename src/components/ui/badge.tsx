import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        success: 'border-transparent bg-success text-success-foreground hover:bg-success/80',
        warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
        info: 'border-transparent bg-info text-info-foreground hover:bg-info/80',
        subtle: 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
      },
      size: {
        default: 'text-xs px-2.5 py-0.5',
        sm: 'text-[10px] px-2 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Whether the badge is interactive
   */
  interactive?: boolean;
}

/**
 * Badge component for displaying status, counts, or labels
 */
function Badge({ className, variant, size, interactive = false, ...props }: BadgeProps) {
  if (interactive) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(badgeVariants({ variant, size }), "transition-transform hover:scale-105", className)}
        type="button"
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
