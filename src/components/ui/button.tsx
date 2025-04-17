import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 ease-in-out hover:shadow-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[36px] max-w-7xl mx-auto",
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] active:bg-[var(--color-accent-dark)] active:scale-95 shadow-sm',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 active:scale-95 shadow-sm',
        outline:
          'bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 active:scale-95',
        secondary:
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-600 active:scale-95 shadow-sm',
        ghost: 'bg-transparent text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 active:scale-95',
        link: 'text-[var(--color-accent)] underline-offset-4 hover:underline hover:text-[var(--color-accent-light)]',
      },
      size: {
        default: 'px-4 py-2 has-[>svg]:px-4',
        sm: 'rounded-xl gap-2 px-4 py-2 has-[>svg]:px-4 min-h-[32px] text-xs',
        lg: 'rounded-xl px-8 py-4 has-[>svg]:px-4 min-h-[40px] text-base',
        icon: 'aspect-square min-w-[36px] min-h-[36px] p-2',
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
