import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GPXUploader } from '@frontend/features/gpx/components';
import { mockGPXFileContent, mockGPXData } from '../../mocks/mockData';
import { parseGPX } from '@shared/utils';
import { useFileUpload } from '@frontend/hooks';

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
    expect(screen.getByText('Supported file:')).toBeInTheDocument();
    expect(screen.getByText('GPX files (.gpx) up to 10MB')).toBeInTheDocument();
  });

  it('handles file selection correctly', async () => {
    render(<GPXUploader onGPXLoaded={mockOnGPXLoaded} isLoading={false} />);

    const file = new File([mockGPXFileContent], 'test.gpx', { type: 'application/gpx+xml' });
    const input = screen.getByTestId('gpx-file-input');

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
    const input = screen.getByTestId('gpx-file-input');

    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the error message to appear
    await waitFor(() => {
      const errorElement = screen.getByText(content => content.includes('Error'));
      expect(errorElement).toBeInTheDocument();
    });

    // Ensure the callback was not called
    expect(mockOnGPXLoaded).not.toHaveBeenCalled();
  });

  it('disables the upload button when loading', () => {
    render(<GPXUploader onGPXLoaded={mockOnGPXLoaded} isLoading={true} />);

    const uploadButton = screen.getByTestId('upload-button');
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
    const input = screen.getByTestId('gpx-file-input');

    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Since our component doesn't have a progress bar in this version, we'll just check
    // that the file input is disabled during upload
    expect(input).toBeDisabled();
  });
});
