'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface NotificationProps {
  id: string;
  type: 'error' | 'info' | 'success';
  message: string;
  duration?: number;
  onDismiss: (id: string) => void; // TODO: Rename to onDismissClick in a future update
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Handle automatic dismissal
  useEffect(() => {
    if (!isVisible || isPaused) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;

      if (remaining <= 0) {
        setIsVisible(false);
        setTimeout(() => onDismiss(id), 300); // Allow time for exit animation
      } else {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      }
    };

    const animationId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [duration, id, isVisible, isPaused, onDismiss]);

  // Handle manual dismissal
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300); // Allow time for exit animation
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  // Get progress bar color based on notification type
  const getProgressColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border shadow-md transition-all duration-300 mb-3',
        getBackgroundColor(),
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        <div className="flex-1 mr-2">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full flex-shrink-0"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className={cn('h-1 transition-all', getProgressColor(), `w-[${progress}%]`)} />
    </div>
  );
};

export default Notification;
