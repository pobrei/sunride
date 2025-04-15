import { mockWeatherData, mockForecastPoints } from './mockData';

/**
 * Mock implementation for the fetch API
 */
export const mockFetch = (url: string, options?: RequestInit) => {
  // Mock weather API responses
  if (url.includes('/api/weather')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: mockWeatherData,
        }),
    });
  }

  // Mock forecast points API responses
  if (url.includes('/api/forecast')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: mockForecastPoints,
        }),
    });
  }

  // Mock file upload API responses
  if (url.includes('/api/upload')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          url: 'https://example.com/uploads/test.gpx',
          fileUrl: 'https://example.com/uploads/test.gpx',
        }),
    });
  }

  // Mock route sharing API responses
  if (url.includes('/api/share')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          shareUrl: 'https://example.com/share/abc123',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
    });
  }

  // Default response for unhandled URLs
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () =>
      Promise.resolve({
        error: 'Not found',
      }),
  });
};

/**
 * Mock implementation for the fetch API with error responses
 */
export const mockFetchWithError = (url: string, options?: RequestInit) => {
  return Promise.resolve({
    ok: false,
    status: 500,
    json: () =>
      Promise.resolve({
        error: 'Internal server error',
      }),
  });
};

/**
 * Mock implementation for the fetch API with network error
 */
export const mockFetchWithNetworkError = () => {
  return Promise.reject(new TypeError('NetworkError when attempting to fetch resource'));
};

/**
 * Mock implementation for the fetch API with timeout error
 */
export const mockFetchWithTimeoutError = () => {
  return Promise.reject(new DOMException('The operation was aborted', 'AbortError'));
};
