import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GPXUploader } from '@/features/gpx/components';
import { mockGPXFileContent, mockGPXData } from '../../mocks/mockData';
import { parseGPX } from '@/utils';
import { useFileUpload } from '@/hooks';

// Mock the hooks
jest.mock('@/hooks', () => ({
  useFileUpload: jest.fn(),
}));

// Mock the utils
jest.mock('@/utils', () => ({
  parseGPX: jest.fn(),
  ValidationError: class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  },
}));

describe('GPXUploader Component', () => {
  const mockOnGPXLoaded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the useFileUpload hook
    (useFileUpload as jest.Mock).mockReturnValue({
      parseGPXFile: jest.fn().mockResolvedValue(mockGPXFileContent),
      isUploading: false,
      progress: 0,
    });

    // Mock the parseGPX function
    (parseGPX as jest.Mock).mockReturnValue(mockGPXData);
  });

  it('renders the uploader correctly', () => {
    render(<GPXUploader onGPXLoaded={mockOnGPXLoaded} isLoading={false} />);

    expect(screen.getByText('Upload GPX File')).toBeInTheDocument();
    expect(screen.getByText('Select GPX file')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Supported format: GPX (GPS Exchange Format)')).toBeInTheDocument();
  });

  it('handles file selection correctly', async () => {
    render(<GPXUploader onGPXLoaded={mockOnGPXLoaded} isLoading={false} />);

    const file = new File([mockGPXFileContent], 'test.gpx', { type: 'application/gpx+xml' });
    const input = screen.getByLabelText('Select GPX file');

    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the file to be processed
    await waitFor(() => {
      expect(mockOnGPXLoaded).toHaveBeenCalledWith(mockGPXData);
    });
  });

  it('shows an error message for invalid GPX files', async () => {
    // Mock the parseGPXFile function to throw an error
    (useFileUpload as jest.Mock).mockReturnValue({
      parseGPXFile: jest.fn().mockRejectedValue(new Error('Invalid GPX file')),
      isUploading: false,
      progress: 0,
    });

    render(<GPXUploader onGPXLoaded={mockOnGPXLoaded} isLoading={false} />);

    const file = new File(['invalid content'], 'test.gpx', { type: 'application/gpx+xml' });
    const input = screen.getByLabelText('Select GPX file');

    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error processing GPX file')).toBeInTheDocument();
    });

    // Ensure the callback was not called
    expect(mockOnGPXLoaded).not.toHaveBeenCalled();
  });

  it('disables the upload button when loading', () => {
    render(<GPXUploader onGPXLoaded={mockOnGPXLoaded} isLoading={true} />);

    const uploadButton = screen.getByText('Upload');
    expect(uploadButton).toBeDisabled();
  });

  it('shows upload progress when uploading', async () => {
    // Mock the useFileUpload hook to show uploading state
    (useFileUpload as jest.Mock).mockReturnValue({
      parseGPXFile: jest.fn().mockResolvedValue(mockGPXFileContent),
      isUploading: true,
      progress: 50,
    });

    render(<GPXUploader onGPXLoaded={mockOnGPXLoaded} isLoading={false} />);

    const file = new File([mockGPXFileContent], 'test.gpx', { type: 'application/gpx+xml' });
    const input = screen.getByLabelText('Select GPX file');

    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Check for the progress bar
    const progressBar = document.querySelector('.bg-primary');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle('width: 50%');
  });
});
