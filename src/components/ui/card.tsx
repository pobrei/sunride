import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { effects } from '@/styles/tailwind-utils';

const cardVariants = cva(
  'bg-white shadow-md rounded-2xl transition-all duration-300 ease-in-out border border-border/30 hover:shadow active:scale-[0.98] text-zinc-700',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg',
        outline: 'border border-border',
        ghost: 'shadow-none bg-transparent',
        glass: effects.glassmorphism,
        primary: 'border-l-4 border-primary',
        secondary: 'border-l-4 border-secondary',
        accent: 'border-l-4 border-accent',
      },
      size: {
        default: 'p-4 space-y-4',
        sm: 'p-4 space-y-2',
        lg: 'p-8 space-y-4',
        compact: 'p-4 space-y-2',
        none: 'p-0',
      },
      hover: {
        default: 'hover:shadow-lg hover:-translate-y-1 hover:border-border/50 dark:hover:border-border/20 active:scale-[0.98]',
        subtle: 'hover:shadow-md hover:-translate-y-0.5 hover:border-border/50 dark:hover:border-border/20 active:scale-[0.98]',
        glow: 'hover:shadow-[0_0_15px_rgba(var(--accent),0.3)]',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'subtle',
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
        interactive && 'cursor-pointer',
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
      'flex items-center justify-between px-4 py-4',
      bordered && 'border-b pb-4 mb-4',
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
    className={cn('text-lg font-semibold', className)}
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
    className={cn('text-sm font-medium text-zinc-500', className)}
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
    className={cn('space-y-4 px-4 py-4', className)}
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
      'flex items-center justify-between px-4 py-4',
      bordered && 'border-t mt-4 pt-4',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
