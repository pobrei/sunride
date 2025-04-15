# Notifications Feature

This folder contains components and utilities for displaying notifications to users.

## Context

- `NotificationProvider`: Context provider for managing notifications.
- `useNotifications`: Hook to access notification functions.
- `SimpleNotificationProvider`: A simpler notification provider with basic functionality.
- `useSimpleNotifications`: Hook to access simple notification functions.

## Types

- `NotificationType`: Type definition for notification objects.
- `NotificationVariant`: Type for different notification styles (success, error, info, warning).

## Usage

```tsx
import { useNotifications } from '@/features/notifications/context';

const MyComponent = () => {
  const { addNotification, removeNotification } = useNotifications();

  const handleAction = () => {
    try {
      // Perform action
      addNotification('success', 'Action completed successfully');
    } catch (error) {
      addNotification('error', 'Failed to complete action');
    }
  };

  return <button onClick={handleAction}>Perform Action</button>;
};
```

## Features

- Multiple notification types (success, error, info, warning)
- Auto-dismissing notifications with configurable duration
- Stacked notifications with proper z-index management
- Accessible notifications with proper ARIA attributes
- Animation for notification appearance/disappearance
- Custom event support for showing notifications from anywhere
