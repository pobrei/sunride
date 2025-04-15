'use client';

import { useState, useEffect } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
      duration: options.duration || 5000,
      action: options.action,
      onDismiss: options.onDismiss,
    };

    setToasts(prevToasts => [...prevToasts, newToast]);

    return {
      id,
      dismiss: () => dismissToast(id),
      update: (options: ToastOptions) => updateToast(id, options),
    };
  };

  const dismissToast = (id: string) => {
    setToasts(prevToasts => {
      const toast = prevToasts.find(t => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      return prevToasts.filter(t => t.id !== id);
    });
  };

  const updateToast = (id: string, options: ToastOptions) => {
    setToasts(prevToasts =>
      prevToasts.map(t =>
        t.id === id
          ? {
              ...t,
              title: options.title ?? t.title,
              description: options.description ?? t.description,
              variant: options.variant ?? t.variant,
              duration: options.duration ?? t.duration,
              action: options.action ?? t.action,
              onDismiss: options.onDismiss ?? t.onDismiss,
            }
          : t
      )
    );
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach(toast => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          dismissToast(toast.id);
        }, toast.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts]);

  return {
    toast,
    toasts,
    dismiss: dismissToast,
    update: updateToast,
  };
}
