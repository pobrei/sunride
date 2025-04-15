'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@frontend/components/ui/use-toast';
import { ToastAction } from '@frontend/components/ui/toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    message: string,
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const addNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      duration = 5000,
      action?: { label: string; onClick: () => void }
    ) => {
      const id = uuidv4();
      const newNotification: Notification = {
        id,
        type,
        message,
        duration,
        action,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Also show as a toast
      toast({
        variant: type === 'error' ? 'destructive' : 'default',
        title: type.charAt(0).toUpperCase() + type.slice(1),
        description: message,
        duration: duration,
        action: action
          ? <ToastAction altText={action.label} onClick={action.onClick}>
              {action.label}
            </ToastAction>
          : undefined,
      });

      return id;
    },
    [toast]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
