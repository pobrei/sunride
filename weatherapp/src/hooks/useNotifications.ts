'use client';

import { useContext } from 'react';
import { NotificationContext } from '@/context/NotificationContext';
import { NotificationVariant } from '@shared/types';

/**
 * Hook to access notification functionality
 * @returns Notification methods
 */
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}

/**
 * Default notification durations by type in milliseconds
 */
export const DEFAULT_NOTIFICATION_DURATIONS = {
  success: 3000,
  error: 5000,
  info: 4000,
  warning: 4000,
};

/**
 * Get default notification duration based on type
 * @param type Notification type
 * @returns Duration in milliseconds
 */
export function getDefaultDuration(type: NotificationVariant): number {
  return DEFAULT_NOTIFICATION_DURATIONS[type] || 4000;
}
