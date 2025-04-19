import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[36px] max-w-7xl mx-auto rounded-md transition-all duration-300 active:scale-[0.97] shadow-sm backdrop-blur-[2px]",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md ring-1 ring-primary/20 hover:scale-[1.02]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md ring-1 ring-destructive/20 hover:scale-[1.02]',
        outline:
          'bg-white/80 dark:bg-transparent border border-border hover:bg-white dark:hover:bg-muted hover:border-primary/20 text-foreground hover:scale-[1.02]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md ring-1 ring-secondary/20 hover:scale-[1.02]',
        ghost: 'hover:bg-white/80 dark:hover:bg-muted/50 text-foreground hover:shadow-sm hover:scale-[1.02]',
        link: 'text-primary underline-offset-4 hover:underline shadow-none',
        success: 'bg-success text-success-foreground hover:bg-success/90 hover:shadow-md ring-1 ring-success/20 hover:scale-[1.02]',
        info: 'bg-info text-info-foreground hover:bg-info/90 hover:shadow-md ring-1 ring-info/20 hover:scale-[1.02]',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-md ring-1 ring-warning/20 hover:scale-[1.02]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md px-3 py-1.5 text-xs',
        lg: 'h-12 rounded-md px-8 py-3 text-base',
        xl: 'h-14 rounded-md px-10 py-4 text-lg',
        icon: 'h-10 w-10 p-2 aspect-square',
        'icon-sm': 'h-8 w-8 p-1.5 aspect-square text-xs',
        'icon-lg': 'h-12 w-12 p-2.5 aspect-square text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot : 'button';

  // If asChild is true, we need to clone the child element and pass our props to it
  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || props.disabled}
        {...props}
      />
    );
  }

  // Otherwise, render a regular button with our content
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || props.children}
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex">{leftIcon}</span>}
          {props.children}
          {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

export { Button, buttonVariants };
