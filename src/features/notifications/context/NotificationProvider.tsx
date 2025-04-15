'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification from '@/components/ui/notification';

interface NotificationContextType {
  addNotification: (
    type: 'error' | 'info' | 'success',
    message: string,
    duration?: number
  ) => string;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

interface NotificationItem {
  id: string;
  type: 'error' | 'info' | 'success';
  message: string;
  duration?: number;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (
    type: 'error' | 'info' | 'success',
    message: string,
    duration = 5000
  ): string => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          {notifications.map(notification => (
            <Notification
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
