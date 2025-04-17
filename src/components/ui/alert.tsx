import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'border-destructive/50 text-destructive bg-destructive/10 [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90',
        success:
          'border-green-500/50 text-green-700 bg-green-50 [&>svg]:text-green-500 *:data-[slot=alert-description]:text-green-700/90',
        warning:
          'border-yellow-500/50 text-yellow-700 bg-yellow-50 [&>svg]:text-yellow-500 *:data-[slot=alert-description]:text-yellow-700/90',
        info: 'border-blue-500/50 text-blue-700 bg-blue-50 [&>svg]:text-blue-500 *:data-[slot=alert-description]:text-blue-700/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  icon,
  dismissible,
  onDismiss,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    /** Optional custom icon */
    icon?: React.ReactNode;
    /** Whether the alert is dismissible */
    dismissible?: boolean;
    /** Callback when the alert is dismissed */
    onDismiss?: () => void;
  }) {
  // Get default icon based on variant
  const getDefaultIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'destructive':
        return <AlertCircle />;
      case 'success':
        return <CheckCircle />;
      case 'warning':
        return <AlertTriangle />;
      case 'info':
        return <Info />;
      default:
        return null;
    }
  };

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {getDefaultIcon()}
      {props.children}
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="absolute right-2 top-2 h-6 w-6 p-0 opacity-70 transition-transform hover:scale-105 hover:opacity-100"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 text-lg font-semibold', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-zinc-500 col-start-2 grid justify-items-start gap-1 text-sm font-medium [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
