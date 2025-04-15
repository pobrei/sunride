'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SimpleNotification, { NotificationType } from '@frontend/components/ui/simple-notification';

interface NotificationContextType {
  addNotification: (type: NotificationType, message: string, duration?: number) => string;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useSimpleNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useSimpleNotifications must be used within a SimpleNotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export function SimpleNotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (type: NotificationType, message: string, duration = 5000): string => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Listen for custom notification events
  useEffect(() => {
    const handleNotificationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: NotificationType;
        message: string;
        duration?: number;
      }>;
      if (customEvent.detail) {
        const { type, message, duration } = customEvent.detail;
        addNotification(type, message, duration);
      }
    };

    document.addEventListener('show-notification', handleNotificationEvent);

    return () => {
      document.removeEventListener('show-notification', handleNotificationEvent);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          {notifications.map(notification => (
            <SimpleNotification
              key={notification.id}
              id={notification.id}
              type={notification.type}
              message={notification.message}
              duration={notification.duration}
              onDismiss={removeNotification}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}
