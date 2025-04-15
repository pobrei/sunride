import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from '@frontend/hooks';
import { useNotifications } from '@frontend/components/providers';
import { ValidationError } from '@shared/utils';

// Mock the useNotifications hook
jest.mock('@frontend/components/providers', () => ({
  useNotifications: jest.fn(),
}));

// Mock the captureException function
jest.mock('@shared/lib/sentry', () => ({
  captureException: jest.fn(),
}));

describe('useFileUpload Hook', () => {
  // Mock FileReader
  const originalFileReader = global.FileReader;
  const mockFileReaderInstance = {
    readAsText: jest.fn(),
    onload: null as any,
    onerror: null as any,
    result: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock addNotification function
    (useNotifications as jest.Mock).mockReturnValue({
      addNotification: jest.fn(),
    });

    // Mock FileReader
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
  });

  afterEach(() => {
    // Restore FileReader
    global.FileReader = originalFileReader;
  });

  it('should validate file type correctly', async () => {
    const { result } = renderHook(() =>
      useFileUpload({
        allowedTypes: ['application/gpx+xml'],
      })
    );

    // Valid file type
    const validFile = new File(['content'], 'test.gpx', { type: 'application/gpx+xml' });

    // Invalid file type
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    // Test valid file
    let parsePromise = result.current.parseGPXFile(validFile);

    // Simulate successful file read
    act(() => {
      mockFileReaderInstance.result = 'valid content';
      mockFileReaderInstance.onload?.({} as any);
    });

    await expect(parsePromise).resolves.toBe('valid content');

    // Test invalid file
    parsePromise = result.current.parseGPXFile(invalidFile);

    // Expect rejection
    await expect(parsePromise).rejects.toThrow(ValidationError);
    await expect(parsePromise).rejects.toThrow('Invalid file type');
  });

  it('should validate file size correctly', async () => {
    const { result } = renderHook(() =>
      useFileUpload({
        maxSize: 10, // 10 bytes
      })
    );

    // Create a file larger than the max size
    const largeFile = new File(['content'.repeat(10)], 'large.gpx', {
      type: 'application/gpx+xml',
    });
    Object.defineProperty(largeFile, 'size', { value: 100 }); // 100 bytes

    // Test large file
    const parsePromise = result.current.parseGPXFile(largeFile);

    // Expect rejection
    await expect(parsePromise).rejects.toThrow(ValidationError);
    await expect(parsePromise).rejects.toThrow('File is too large');
  });

  it('should handle file read errors', async () => {
    const { result } = renderHook(() => useFileUpload());

    const file = new File(['content'], 'test.gpx', { type: 'application/gpx+xml' });

    // Test file read error
    const parsePromise = result.current.parseGPXFile(file);

    // Simulate file read error
    act(() => {
      mockFileReaderInstance.onerror?.({} as any);
    });

    // Expect rejection
    await expect(parsePromise).rejects.toThrow('Error reading file');
  });

  it('should show error notifications when enabled', async () => {
    const addNotification = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({ addNotification });

    const { result } = renderHook(() =>
      useFileUpload({
        showErrorNotifications: true,
      })
    );

    // Invalid file type
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    // Test invalid file
    try {
      await result.current.parseGPXFile(invalidFile);
    } catch (error) {
      // Expected error
    }

    // Check if notification was shown
    expect(addNotification).toHaveBeenCalledWith('error', expect.any(String));
  });

  it('should not show error notifications when disabled', async () => {
    const addNotification = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({ addNotification });

    const { result } = renderHook(() =>
      useFileUpload({
        showErrorNotifications: false,
      })
    );

    // Invalid file type
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    // Test invalid file
    try {
      await result.current.parseGPXFile(invalidFile);
    } catch (error) {
      // Expected error
    }

    // Check if notification was not shown
    expect(addNotification).not.toHaveBeenCalled();
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useFileUpload());

    // Set error state
    act(() => {
      result.current.reset();
    });

    // Check if state was reset
    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });
});
