'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Notification, { NotificationProps } from '@/components/ui/notification';
import { cn } from '@/lib/utils';

export interface NotificationContainerProps {
  /** Position of the notification container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
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
      onDismiss: (id) => removeNotification(id),
    };

    setNotifications((prev) => {
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
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
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
  React.useImperativeHandle(
    React.useRef<{
      addNotification: (notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => string;
      removeNotification: (id: string) => void;
      clearNotifications: () => void;
    }>(),
    () => ({
      addNotification,
      removeNotification,
      clearNotifications,
    })
  );

  if (!isMounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed z-50 flex flex-col p-4 max-w-md w-full max-h-screen overflow-hidden pointer-events-none',
        getPositionClasses(),
        position.includes('top') ? 'items-end' : 'items-start flex-col-reverse',
        className
      )}
      aria-live="polite"
    >
      {notifications.map((notification) => (
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
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  // Add a new notification
  const addNotification = (notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onDismiss: (id) => removeNotification(id),
    };

    setNotifications((prev) => [newNotification, ...prev]);

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
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
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
      <NotificationContainer
        position="bottom-right"
        maxNotifications={5}
      />
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

/**
 * A utility function to show a notification
 */
export function showNotification(notification: Omit<NotificationProps, 'id' | 'onDismiss'>) {
  const context = React.useContext(NotificationContext);
  if (!context) {
    console.error('showNotification must be used within a NotificationProvider');
    return '';
  }
  return context.addNotification(notification);
}
