import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '@frontend/features/notifications/context';

// Test component that uses the notifications context
const NotificationTester = () => {
  const { addNotification } = useNotifications();

  return (
    <div>
      <button onClick={() => addNotification('success', 'Success message')}>Add Success</button>
      <button onClick={() => addNotification('error', 'Error message')}>Add Error</button>
      <button onClick={() => addNotification('info', 'Info message')}>Add Info</button>
      <button onClick={() => addNotification('warning', 'Warning message')}>Add Warning</button>
    </div>
  );
};

describe('Notifications System', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should display a success notification', async () => {
    render(
      <NotificationProvider>
        <NotificationTester />
      </NotificationProvider>
    );

    // Click the button to add a success notification
    fireEvent.click(screen.getByText('Add Success'));

    // Check that the notification is displayed
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Wait for the notification to disappear
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('should display an error notification', async () => {
    render(
      <NotificationProvider>
        <NotificationTester />
      </NotificationProvider>
    );

    // Click the button to add an error notification
    fireEvent.click(screen.getByText('Add Error'));

    // Check that the notification is displayed
    expect(screen.getByText('Error message')).toBeInTheDocument();

    // Wait for the notification to disappear
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  it('should display multiple notifications', async () => {
    render(
      <NotificationProvider>
        <NotificationTester />
      </NotificationProvider>
    );

    // Add multiple notifications
    fireEvent.click(screen.getByText('Add Success'));
    fireEvent.click(screen.getByText('Add Error'));
    fireEvent.click(screen.getByText('Add Info'));

    // Check that all notifications are displayed
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();

    // Wait for the notifications to disappear
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
    });
  });

  it('should allow dismissing a notification', async () => {
    render(
      <NotificationProvider>
        <NotificationTester />
      </NotificationProvider>
    );

    // Add a notification
    fireEvent.click(screen.getByText('Add Warning'));

    // Check that the notification is displayed
    expect(screen.getByText('Warning message')).toBeInTheDocument();

    // Find and click the dismiss button
    const dismissButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(dismissButton);

    // Check that the notification is no longer displayed
    await waitFor(() => {
      expect(screen.queryByText('Warning message')).not.toBeInTheDocument();
    });
  });
});
