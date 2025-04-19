import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { effects } from '@/styles/tailwind-utils';

const cardVariants = cva(
  'bg-card border border-border text-foreground rounded-lg overflow-hidden transition-all duration-300 backdrop-blur-[2px]',
  {
    variants: {
      variant: {
        default: 'shadow-sm bg-white/90 dark:bg-card',
        elevated: 'shadow-md bg-white/95 dark:bg-card',
        outline: 'border border-border bg-white/90 dark:bg-card',
        ghost: 'bg-transparent border-none',
        glass: 'bg-white/80 dark:bg-card/80 backdrop-blur-sm',
        primary: 'border-l-4 border-primary bg-white/90 dark:bg-card',
        secondary: 'border-l-4 border-secondary bg-white/90 dark:bg-card',
        accent: 'border-l-4 border-accent bg-white/90 dark:bg-card',
        info: 'border-l-4 border-info bg-white/90 dark:bg-card',
        success: 'border-l-4 border-success bg-white/90 dark:bg-card',
        warning: 'border-l-4 border-warning bg-white/90 dark:bg-card',
        destructive: 'border-l-4 border-destructive bg-white/90 dark:bg-card',
      },
      size: {
        default: 'p-5 space-y-4',
        sm: 'p-3 space-y-3',
        lg: 'p-6 space-y-5',
        compact: 'p-2.5 space-y-2',
        none: 'p-0',
      },
      hover: {
        default: 'transition-all duration-300',
        subtle: 'transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:bg-white dark:hover:bg-card/90',
        glow: 'transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:bg-white dark:hover:bg-card/90',
        scale: 'transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:bg-white dark:hover:bg-card/90',
        lift: 'transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white dark:hover:bg-card/90',
        pulse: 'transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:bg-white dark:hover:bg-card/90 hover:animate-pulse',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'none',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Whether the card is interactive */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, hover, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        cardVariants({ variant, size, hover }),
        interactive && 'cursor-pointer hover:shadow-md hover:border-primary/20 hover:bg-white dark:hover:bg-card/90 transition-all duration-300 hover:scale-[1.01]',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Whether the card header should have a border */
    bordered?: boolean;
  }
>(({ className, bordered = false, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn(
      'flex items-center justify-between p-4 bg-card',
      bordered && 'border-b border-border',
      'sticky top-0 z-10',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Comp = 'h3', ...props }, ref) => (
  <Comp
    ref={ref}
    data-slot="card-title"
    className={cn('text-lg font-semibold text-foreground tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn('p-4 bg-card overflow-auto', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Whether the card footer should have a border */
    bordered?: boolean;
  }
>(({ className, bordered = false, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn(
      'flex items-center justify-between p-4 bg-card',
      bordered && 'border-t border-border',
      'sticky bottom-0 z-10',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
