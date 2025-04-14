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
}));

jest.mock('@/features/gpx/utils/gpxParser', () => ({
  parseGPX: jest.fn(),
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
  });
  
  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render the upload button', () => {
    const handleGPXLoaded = jest.fn();
    
    render(<GPXUploader onGPXLoaded={handleGPXLoaded} />);
    
    expect(screen.getByText(/upload gpx/i)).toBeInTheDocument();
  });
  
  it('should handle file upload and parse GPX data', async () => {
    const handleGPXLoaded = jest.fn();
    const addNotification = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({ addNotification });
    
    render(<GPXUploader onGPXLoaded={handleGPXLoaded} />);
    
    // Create a mock file
    const file = new File([mockGPXFileContent], 'test.gpx', { type: 'application/gpx+xml' });
    
    // Get the file input
    const fileInput = screen.getByLabelText(/upload gpx/i) || screen.getByTestId('gpx-file-input');
    
    // Simulate file upload
    await userEvent.upload(fileInput, file);
    
    // Wait for the file to be processed
    await waitFor(() => {
      expect(parseGPX).toHaveBeenCalledWith(mockGPXFileContent);
      expect(handleGPXLoaded).toHaveBeenCalledWith(mockGPXData);
      expect(addNotification).toHaveBeenCalledWith('success', expect.any(String));
    });
  });
  
  it('should show error notification when GPX parsing fails', async () => {
    const handleGPXLoaded = jest.fn();
    const addNotification = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({ addNotification });
    
    // Mock parseGPX to throw an error
    (parseGPX as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid GPX file');
    });
    
    render(<GPXUploader onGPXLoaded={handleGPXLoaded} />);
    
    // Create a mock file
    const file = new File(['<invalid>Not a GPX file</invalid>'], 'test.gpx', { type: 'application/gpx+xml' });
    
    // Get the file input
    const fileInput = screen.getByLabelText(/upload gpx/i) || screen.getByTestId('gpx-file-input');
    
    // Simulate file upload
    await userEvent.upload(fileInput, file);
    
    // Wait for the error notification
    await waitFor(() => {
      expect(parseGPX).toHaveBeenCalled();
      expect(handleGPXLoaded).not.toHaveBeenCalled();
      expect(addNotification).toHaveBeenCalledWith('error', expect.any(String));
    });
  });
  
  it('should handle drag and drop of GPX files', async () => {
    const handleGPXLoaded = jest.fn();
    
    render(<GPXUploader onGPXLoaded={handleGPXLoaded} />);
    
    // Get the drop zone
    const dropZone = screen.getByText(/upload gpx/i).closest('div') || screen.getByTestId('gpx-drop-zone');
    
    // Create a mock file
    const file = new File([mockGPXFileContent], 'test.gpx', { type: 'application/gpx+xml' });
    
    // Create a mock drop event
    const dropEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: {
        files: [file],
        clearData: jest.fn(),
      },
    };
    
    // Simulate drag and drop
    fireEvent.drop(dropZone, dropEvent);
    
    // Wait for the file to be processed
    await waitFor(() => {
      expect(parseGPX).toHaveBeenCalledWith(mockGPXFileContent);
      expect(handleGPXLoaded).toHaveBeenCalledWith(mockGPXData);
    });
  });
});
