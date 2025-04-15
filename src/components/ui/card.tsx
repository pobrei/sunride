import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { effects } from '@/styles/tailwind-utils';

const cardVariants = cva(
  'rounded-lg bg-card text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border shadow-sm',
        elevated: 'border shadow-md',
        outline: 'border-2',
        ghost: 'border-none shadow-none bg-transparent',
        glass: effects.glassmorphism,
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        compact: 'p-3',
        none: 'p-0',
      },
      hover: {
        default: 'hover:shadow-md hover:translate-y-[-2px]',
        subtle: 'hover:shadow-sm hover:translate-y-[-1px]',
        glow: 'hover:shadow-[0_0_15px_rgba(var(--primary),0.3)]',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'default',
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
      'flex flex-col space-y-1.5 rounded-t-lg px-6 pt-6 pb-4',
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
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
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
    className={cn('px-6 py-2', className)}
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
      'flex items-center rounded-b-lg px-6 pt-4 pb-6',
      bordered && 'border-t mt-4',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
