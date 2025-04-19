'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Notification, { NotificationProps } from '@/components/ui/notification';
import { cn } from '@/lib/utils';

export interface NotificationContainerProps {
  /** Position of the notification container */
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  /** Maximum number of notifications to show */
  maxNotifications?: number;
  /** Optional className for styling */
  className?: string;
}

/**
 * A container for notifications that handles positioning and stacking
 */
export function NotificationContainer({
  position = 'bottom-right',
  maxNotifications = 5,
  className,
}: NotificationContainerProps) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Add a new notification
  const addNotification = (notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onDismiss: id => removeNotification(id),
    };

    setNotifications(prev => {
      // Limit the number of notifications
      const updatedNotifications = [newNotification, ...prev].slice(0, maxNotifications);
      return updatedNotifications;
    });

    // Auto-dismiss if duration is provided
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  };

  // Remove a notification by ID
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0';
      case 'top-left':
        return 'top-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'top-center':
        return 'top-0 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-0 left-1/2 -translate-x-1/2';
      default:
        return 'bottom-0 right-0';
    }
  };

  // Expose methods via ref
  const methodsRef = React.useRef<{
    addNotification: (notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
  }>(null);

  React.useImperativeHandle(methodsRef, () => ({
    addNotification,
    removeNotification,
    clearNotifications,
  }));

  if (!isMounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed z-[200] flex flex-col p-4 max-w-md w-full max-h-screen overflow-hidden pointer-events-none',
        getPositionClasses(),
        position.includes('top') ? 'items-end' : 'items-start flex-col-reverse',
        className
      )}
      aria-live="polite"
    >
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto w-full">
          <Notification {...notification} />
        </div>
      ))}
    </div>,
    document.body
  );
}

// Create a global notification context
const NotificationContext = React.createContext<{
  addNotification: (notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
} | null>(null);

/**
 * A provider for the notification context
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setNotificationItems] = useState<NotificationProps[]>([]);

  // Add a new notification
  const addNotification = (notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onDismiss: id => removeNotification(id),
    };

    setNotificationItems(prev => [newNotification, ...prev]);

    // Auto-dismiss if duration is provided
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  };

  // Remove a notification by ID
  const removeNotification = (id: string) => {
    setNotificationItems(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotificationItems([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
      <NotificationContainer position="bottom-right" maxNotifications={5} />
    </NotificationContext.Provider>
  );
}

/**
 * A hook to use the notification context
 */
export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Define a type for the notification context
type NotificationContextType = {
  addNotification: (notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
} | null;

// Define a type for the global window with our custom property
interface CustomWindow extends Window {
  __NOTIFICATION_CONTEXT__?: NotificationContextType;
}

/**
 * A utility function to show a notification
 * Note: This should only be used in non-React components
 */
export function showNotification(notification: Omit<NotificationProps, 'id' | 'onDismiss'>) {
  // Get the context from the global window object if available
  // This avoids using React hooks outside of React components
  const customWindow = window as CustomWindow;
  const context = typeof window !== 'undefined' && customWindow.__NOTIFICATION_CONTEXT__ ?
    customWindow.__NOTIFICATION_CONTEXT__ : null;

  if (!context) {
    console.error('showNotification must be used within a NotificationProvider');
    return '';
  }
  return context.addNotification(notification);
}

// Store the context in the global window object for non-React components
if (typeof window !== 'undefined') {
  const customWindow = window as CustomWindow;
  customWindow.__NOTIFICATION_CONTEXT__ = null;

  // Update the context reference when the provider mounts
  const originalCreateContext = React.createContext;
  // We need to use any here because we're monkey-patching React's internal API

  React.createContext = function<T>(defaultValue: T) {
    const context = originalCreateContext<T>(defaultValue);
    if (context === NotificationContext) {
      const originalProvider = context.Provider;

      context.Provider = function(props: React.ProviderProps<T>) {
        const customWindow = window as CustomWindow;
        customWindow.__NOTIFICATION_CONTEXT__ = props.value as unknown as NotificationContextType;
        return originalProvider(props);
      } as typeof context.Provider;
    }
    return context;
  } as typeof React.createContext;
}
