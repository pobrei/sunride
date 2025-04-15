import { renderHook, act } from '@testing-library/react';
import { useApi } from '@/hooks';
import { mockFetch, mockFetchWithError, mockFetchWithNetworkError } from '../mocks/mockFetch';
import { useNotifications } from '@/components/providers';

// Mock useNotifications hook
jest.mock('@/components/providers', () => ({
  useNotifications: jest.fn(),
}));

// Mock Sentry
jest.mock('@/lib/sentry', () => ({
  captureException: jest.fn(),
}));

describe('useApi Hook', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock addNotification function
    (useNotifications as jest.Mock).mockReturnValue({
      addNotification: jest.fn(),
    });

    // Mock fetch
    global.fetch = jest.fn().mockImplementation(mockFetch);
  });

  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with the correct state', () => {
    const { result } = renderHook(() => useApi(null));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful GET requests', async () => {
    const { result } = renderHook(() => useApi(null));

    await act(async () => {
      await result.current.get('/api/weather');
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/weather',
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('should handle successful POST requests', async () => {
    const { result } = renderHook(() => useApi(null));
    const postData = { test: true };

    await act(async () => {
      await result.current.post('/api/weather', postData);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/weather',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postData),
      })
    );
  });

  it('should handle API errors', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockImplementation(mockFetchWithError);

    const { result } = renderHook(() => useApi(null));

    await act(async () => {
      try {
        await result.current.get('/api/weather');
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Internal server error');
  });

  it('should handle network errors', async () => {
    // Mock fetch to throw a network error
    global.fetch = jest.fn().mockImplementation(mockFetchWithNetworkError);

    const { result } = renderHook(() => useApi(null));

    await act(async () => {
      try {
        await result.current.get('/api/weather');
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe(
      'Network error. Please check your internet connection.'
    );
  });

  it('should show error notifications when enabled', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockImplementation(mockFetchWithError);

    const addNotification = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({ addNotification });

    const { result } = renderHook(() => useApi(null, { showErrorNotifications: true }));

    await act(async () => {
      try {
        await result.current.get('/api/weather');
      } catch (error) {
        // Expected error
      }
    });

    expect(addNotification).toHaveBeenCalledWith('error', expect.any(String));
  });

  it('should not show error notifications when disabled', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockImplementation(mockFetchWithError);

    const addNotification = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({ addNotification });

    const { result } = renderHook(() => useApi(null, { showErrorNotifications: false }));

    await act(async () => {
      try {
        await result.current.get('/api/weather');
      } catch (error) {
        // Expected error
      }
    });

    expect(addNotification).not.toHaveBeenCalled();
  });

  it('should reset the state correctly', async () => {
    const { result } = renderHook(() => useApi('initial'));

    // First, make a successful request
    await act(async () => {
      await result.current.get('/api/weather');
    });

    expect(result.current.data).toBeDefined();

    // Then reset the state
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe('initial');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
