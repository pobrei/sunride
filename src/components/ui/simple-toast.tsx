'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { classNames } from '@/utils/classNames';

// Toast types
export type ToastType = 'default' | 'destructive' | 'success' | 'warning' | 'info';

// Toast interface
export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastType;
  duration?: number;
}

// Context type
interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Create context
const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Toast provider
export function SimpleToastProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>): void => {
    const id: string = Math.random().toString(36).substring(2, 9);
    const newToast: ToastProps = { ...toast, id };

    setToasts((prev: ToastProps[]): ToastProps[] => [...prev, newToast]);

    if (toast.duration !== undefined && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string): void => {
    setToasts((prev: ToastProps[]): ToastProps[] => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <SimpleToastViewport />
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the toast context
 * @returns Toast context with methods to add and remove toasts
 */
export function useSimpleToast(): ToastContextType {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useSimpleToast must be used within a SimpleToastProvider');
  }
  return context;
}

// Toast variants
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'border-red-500 bg-red-500 text-white',
        success: 'border-green-500 bg-green-500 text-white',
        warning: 'border-yellow-500 bg-yellow-500 text-white',
        info: 'border-blue-500 bg-blue-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Component to display the appropriate icon based on toast variant
 * @param variant - The toast variant
 * @returns The icon component for the variant
 */
function ToastIcon({ variant }: { variant?: ToastType }): React.ReactNode {
  const icons: Record<ToastType, React.ReactNode> = {
    default: null,
    destructive: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const icon: React.ReactNode = variant ? icons[variant] : null;
  return icon ? <div className="mr-3">{icon}</div> : null;
}

// Toast component
export function SimpleToast({
  id,
  variant,
  className,
  children,
}: React.PropsWithChildren<{
  id: string;
  variant?: ToastType;
  className?: string;
}>) {
  const { removeToast } = useSimpleToast();

  return (
    <div
      className={classNames(
        toastVariants({ variant }),
        'animate-in slide-in-from-right-full',
        className
      )}
    >
      <div className="flex items-center">
        <ToastIcon variant={variant} />
        <div>{children}</div>
      </div>
      <button
        type="button"
        onClick={() => removeToast(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Component for toast title
 */
export function SimpleToastTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={classNames('text-sm font-semibold', className)} {...props} />;
}

/**
 * Component for toast description
 */
export function SimpleToastDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={classNames('text-sm opacity-90', className)} {...props} />;
}

/**
 * Component for toast viewport
 */
export function SimpleToastViewport(): React.ReactElement {
  const { toasts, removeToast } = useSimpleToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]">
      {toasts.map(toast => (
        <SimpleToast key={toast.id} id={toast.id} variant={toast.variant} className="mb-2">
          <div className="grid gap-1">
            {toast.title && <SimpleToastTitle>{toast.title}</SimpleToastTitle>}
            {toast.description && (
              <SimpleToastDescription>{toast.description}</SimpleToastDescription>
            )}
          </div>
          {toast.action}
        </SimpleToast>
      ))}
    </div>
  );
}

/**
 * Helper function to show a toast notification
 * @param options - Toast options
 */
export function simpleToast({
  title,
  description,
  variant = 'default',
  duration = 5000,
  action,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastType;
  duration?: number;
  action?: React.ReactNode;
}): void {
  // This is a client-side only function
  if (typeof window !== 'undefined') {
    // Get the toast context from the DOM
    const toastRoot: HTMLElement | null = document.getElementById('toast-root');
    if (!toastRoot) {
      console.error('Toast root element not found');
      return;
    }

    // Create a custom event to trigger the toast
    const event: CustomEvent = new CustomEvent('toast', {
      detail: {
        title,
        description,
        variant,
        duration,
        action,
      },
    });

    // Dispatch the event
    toastRoot.dispatchEvent(event);
  }
}

/**
 * Toaster component that renders the toast provider
 */
export function SimpleToaster(): React.ReactElement {
  return (
    <div id="toast-root">
      <SimpleToastProvider>{null}</SimpleToastProvider>
    </div>
  );
}
