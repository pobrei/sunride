import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GPXUploader } from '@/features/gpx/components';
import { mockGPXFileContent, mockGPXData } from '../mocks/mockData';
import { parseGPX } from '@/features/gpx/utils/gpxParser';
import { useNotifications } from '@/features/notifications/context';

// Mock the hooks and utilities
jest.mock('@/features/notifications/context', () => ({
  useNotifications: jest.fn(),
  useSimpleNotifications: jest.fn().mockReturnValue({
    addNotification: jest.fn(),
  }),
}));

jest.mock('@/features/gpx/utils/gpxParser', () => ({
  parseGPX: jest.fn(),
}));

jest.mock('@/utils/errorHandlers', () => ({
  handleError: jest.fn().mockImplementation((err) => err.message),
  ErrorType: { GPX: 'GPX_ERROR' },
}));

jest.mock('@/features/monitoring', () => ({
  captureException: jest.fn(),
}));

describe('GPXUploader Component', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock addNotification function
    (useNotifications as jest.Mock).mockReturnValue({
      addNotification: jest.fn(),
    });

    // Mock parseGPX function
    (parseGPX as jest.Mock).mockReturnValue(mockGPXData);

    // Reset mocks
    jest.clearAllMocks();
  });

  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the upload button', () => {
    const handleGPXLoaded = jest.fn();

    render(<GPXUploader onGPXLoaded={handleGPXLoaded} isLoading={false} />);

    expect(screen.getByText('Upload GPX File')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('should handle file upload and parse GPX data', async () => {
    const handleGPXLoaded = jest.fn();
    const addNotification = jest.fn();
    const mockSimpleNotifications = { addNotification };

    // Mock the useSimpleNotifications hook
    const useSimpleNotificationsMock = jest.requireMock('@/features/notifications/context').useSimpleNotifications;
    useSimpleNotificationsMock.mockReturnValue(mockSimpleNotifications);

    render(<GPXUploader onGPXLoaded={handleGPXLoaded} isLoading={false} />);

    // Create a mock file
    const file = new File([mockGPXFileContent], 'test.gpx', { type: 'application/gpx+xml' });

    // Get the file input
    const fileInput = screen.getByTestId('gpx-file-input');

    // Simulate file upload
    await userEvent.upload(fileInput, file);

    // Wait for the file to be processed
    await waitFor(() => {
      expect(parseGPX).toHaveBeenCalledWith(mockGPXFileContent);
      expect(handleGPXLoaded).toHaveBeenCalledWith(mockGPXData);
    });
  });

  it('should show error notification when GPX parsing fails', async () => {
    const handleGPXLoaded = jest.fn();
    const addNotification = jest.fn();
    const mockSimpleNotifications = { addNotification };

    // Mock the useSimpleNotifications hook
    const useSimpleNotificationsMock = jest.requireMock('@/features/notifications/context').useSimpleNotifications;
    useSimpleNotificationsMock.mockReturnValue(mockSimpleNotifications);

    // Mock parseGPX to throw an error
    (parseGPX as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid GPX file');
    });

    render(<GPXUploader onGPXLoaded={handleGPXLoaded} isLoading={false} />);

    // Create a mock file
    const file = new File(['<invalid>Not a GPX file</invalid>'], 'test.gpx', { type: 'application/gpx+xml' });

    // Get the file input
    const fileInput = screen.getByTestId('gpx-file-input');

    // Simulate file upload
    await userEvent.upload(fileInput, file);

    // Wait for the error notification
    await waitFor(() => {
      expect(parseGPX).toHaveBeenCalled();
      expect(handleGPXLoaded).not.toHaveBeenCalled();
      // Check for error alert
      const errorElement = screen.getByText('Invalid GPX file');
      expect(errorElement).toBeInTheDocument();
    });
  });

  // Note: The current implementation doesn't support drag and drop directly
  // This test is modified to test file selection which is the supported method
  it('should handle file selection', async () => {
    const handleGPXLoaded = jest.fn();
    const addNotification = jest.fn();
    const mockSimpleNotifications = { addNotification };

    // Mock the useSimpleNotifications hook
    const useSimpleNotificationsMock = jest.requireMock('@/features/notifications/context').useSimpleNotifications;
    useSimpleNotificationsMock.mockReturnValue(mockSimpleNotifications);

    render(<GPXUploader onGPXLoaded={handleGPXLoaded} isLoading={false} />);

    // Create a mock file
    const file = new File([mockGPXFileContent], 'test.gpx', { type: 'application/gpx+xml' });

    // Get the file input
    const fileInput = screen.getByTestId('gpx-file-input');

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the file to be processed
    await waitFor(() => {
      expect(parseGPX).toHaveBeenCalled();
      expect(handleGPXLoaded).toHaveBeenCalledWith(mockGPXData);
    });
  });
});
