'use client';

/**
 * MobileToast Component
 * 
 * This component provides a mobile-friendly toast notification system
 * following iOS 19 design principles.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface MobileToastProps {
  /** Toast data */
  toast: Toast;
  /** Function called when the toast is closed */
  onClose: (id: string) => void;
  /** Additional class names */
  className?: string;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
}

/**
 * Individual toast notification component
 */
const MobileToast: React.FC<MobileToastProps> = ({
  toast,
  onClose,
  className,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
}) => {
  // Auto-close timer
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  // Get icon based on toast type
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get background color based on toast type
  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/30';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/30';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/30';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-950/30';
    }
  };

  // Get border color based on toast type
  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 dark:border-green-800/30';
      case 'error':
        return 'border-red-200 dark:border-red-800/30';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/30';
      case 'info':
      default:
        return 'border-blue-200 dark:border-blue-800/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'w-full max-w-md pointer-events-auto overflow-hidden',
        rounded && 'rounded-lg',
        bordered && 'border',
        shadowed && 'shadow-md',
        glass && 'backdrop-blur-sm',
        getBackgroundColor(),
        getBorderColor(),
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {toast.title && (
              <p className="text-sm font-medium">{toast.title}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {toast.message}
            </p>
            {toast.action && (
              <div className="mt-3">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={toast.action.onClick}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => onClose(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface MobileToastProviderProps {
  /** Children components */
  children: React.ReactNode;
  /** Position of the toast container */
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  /** Maximum number of toasts to show at once */
  maxToasts?: number;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
}

/**
 * Context for the toast provider
 */
export const ToastContext = React.createContext<{
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}>({
  showToast: () => '',
  hideToast: () => {},
  clearToasts: () => {},
});

/**
 * Hook to use the toast context
 */
export const useToast = () => React.useContext(ToastContext);

/**
 * A mobile-friendly toast notification provider
 * following iOS 19 design principles
 */
export function MobileToastProvider({
  children,
  position = 'bottom-center',
  maxToasts = 3,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
}: MobileToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show a new toast
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts(prev => {
      // Remove oldest toasts if we exceed maxToasts
      const newToasts = [...prev];
      if (newToasts.length >= maxToasts) {
        newToasts.shift();
      }
      
      return [...newToasts, { ...toast, id }];
    });
    
    return id;
  }, [maxToasts]);

  // Hide a toast by ID
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0 sm:items-start';
      case 'top-right':
        return 'top-0 right-0 sm:items-end';
      case 'top-center':
        return 'top-0 left-1/2 -translate-x-1/2 sm:items-center';
      case 'bottom-left':
        return 'bottom-0 left-0 sm:items-start';
      case 'bottom-right':
        return 'bottom-0 right-0 sm:items-end';
      case 'bottom-center':
      default:
        return 'bottom-0 left-1/2 -translate-x-1/2 sm:items-center';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearToasts }}>
      {children}
      
      {/* Toast container */}
      <div
        className={cn(
          'fixed z-50 p-4 sm:p-6 flex flex-col gap-2 pointer-events-none max-w-full w-full sm:max-w-md',
          getPositionClasses()
        )}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <MobileToast
              key={toast.id}
              toast={toast}
              onClose={hideToast}
              glass={glass}
              bordered={bordered}
              shadowed={shadowed}
              rounded={rounded}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default MobileToastProvider;
