'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { classNames } from '@/utils/classNames';
import { Button } from '@/components/ui/button';

// Simple toast context
type ToastType = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    if (toast.duration !== undefined && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

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

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  id: string;
  onClose: () => void;
}

function ToastIcon({ variant }: { variant?: ToastType }) {
  const icons = {
    default: null,
    destructive: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const icon = variant ? icons[variant] : null;
  return icon ? <div className="mr-3">{icon}</div> : null;
}

function Toast({ id, variant, className, onClose, children, ...props }: ToastProps) {
  return (
    <div
      className={classNames(
        toastVariants({ variant }),
        'animate-in slide-in-from-right-full',
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        <ToastIcon variant={variant} />
        <div>{children}</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-2 top-2 h-6 w-6 p-0 text-foreground/50 opacity-0 transition-transform hover:scale-105 hover:text-foreground focus:opacity-100 group-hover:opacity-100"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames('text-sm font-semibold', className)} {...props} />;
}

function ToastDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames('text-sm opacity-90', className)} {...props} />;
}

function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[200] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
          className="mb-2"
        >
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          {toast.action}
        </Toast>
      ))}
    </div>
  );
}

export function toast({
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
}) {
  const { addToast } = useToast();
  addToast({ title, description, variant, duration, action });
}

// Export types and components
export type { Toast as ToastProps };
export { ToastViewport, Toast, ToastTitle, ToastDescription };
