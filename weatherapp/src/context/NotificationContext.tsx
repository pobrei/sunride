'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { NotificationType, NotificationVariant } from '@shared/types';

/**
 * Notification context interface
 */
interface NotificationContextType {
  /** List of active notifications */
  notifications: NotificationType[];
  /** Add a new notification */
  addNotification: (type: NotificationVariant, message: string, options?: Partial<Omit<NotificationType, 'id' | 'type' | 'message'>>) => string;
  /** Remove a notification by ID */
  removeNotification: (id: string) => void;
  /** Clear all notifications */
  clearNotifications: () => void;
}

// Create context with undefined default value
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Notification provider component
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  /**
   * Add a new notification
   */
  const addNotification = useCallback((
    type: NotificationVariant,
    message: string,
    options?: Partial<Omit<NotificationType, 'id' | 'type' | 'message'>>
  ) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newNotification: NotificationType = {
      id,
      type,
      message,
      duration: type === 'error' ? undefined : 5000, // Default duration, undefined = no auto-dismiss
      ...options
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss if duration is set
    if (newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  /**
   * Remove a notification by ID
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Create context value
  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
