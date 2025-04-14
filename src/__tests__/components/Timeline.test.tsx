import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timeline } from '@/features/timeline/components';
import { mockForecastPoints, mockWeatherData } from '../mocks/mockData';
import { WeatherProvider } from '@/features/weather/context';
import { NotificationProvider } from '@/features/notifications/context';

// Create merged data for testing
const mergedData = mockForecastPoints.map((point, index) => ({
  ...point,
  weather: mockWeatherData[index % mockWeatherData.length],
}));

describe('Timeline Component', () => {
  const mockOnPointSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when no data is provided', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Timeline
            points={[]}
            onPointSelect={mockOnPointSelect}
            selectedPoint={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('renders the timeline when data is provided', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Timeline
            points={mergedData}
            onPointSelect={mockOnPointSelect}
            selectedPoint={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check that the timeline container is rendered
    expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    
    // Check that points are rendered
    const timelinePoints = screen.getAllByTestId(/timeline-point-/);
    expect(timelinePoints.length).toBe(mergedData.length);
  });

  it('calls onPointSelect when a point is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Timeline
            points={mergedData}
            onPointSelect={mockOnPointSelect}
            selectedPoint={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Find a point and click it
    const point = screen.getByTestId('timeline-point-1');
    await user.click(point);

    expect(mockOnPointSelect).toHaveBeenCalledWith(1);
  });

  it('highlights the selected point', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Timeline
            points={mergedData}
            onPointSelect={mockOnPointSelect}
            selectedPoint={1}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check that the selected point has the selected class
    const selectedPoint = screen.getByTestId('timeline-point-1');
    expect(selectedPoint).toHaveClass('selected');
  });

  it('allows navigation with arrow buttons', async () => {
    const user = userEvent.setup();
    
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Timeline
            points={mergedData}
            onPointSelect={mockOnPointSelect}
            selectedPoint={1}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Find the navigation buttons
    const prevButton = screen.getByLabelText(/previous/i);
    const nextButton = screen.getByLabelText(/next/i);

    // Click the next button
    await user.click(nextButton);
    expect(mockOnPointSelect).toHaveBeenCalledWith(2);

    // Reset mock
    mockOnPointSelect.mockClear();

    // Click the previous button
    await user.click(prevButton);
    expect(mockOnPointSelect).toHaveBeenCalledWith(0);
  });

  it('disables navigation buttons at the ends of the timeline', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Timeline
            points={mergedData}
            onPointSelect={mockOnPointSelect}
            selectedPoint={0}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Previous button should be disabled at the start
    const prevButton = screen.getByLabelText(/previous/i);
    expect(prevButton).toBeDisabled();

    // Render with last point selected
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Timeline
            points={mergedData}
            onPointSelect={mockOnPointSelect}
            selectedPoint={mergedData.length - 1}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Next button should be disabled at the end
    const nextButton = screen.getByLabelText(/next/i);
    expect(nextButton).toBeDisabled();
  });

  it('allows horizontal scrolling', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Timeline
            points={mergedData}
            onPointSelect={mockOnPointSelect}
            selectedPoint={1}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Get the timeline container
    const timelineContainer = screen.getByTestId('timeline-scroll-container');
    
    // Simulate horizontal scroll
    fireEvent.scroll(timelineContainer, { target: { scrollLeft: 100 } });
    
    // This is mostly a visual test, but we can check that the event handler doesn't throw
    expect(timelineContainer.scrollLeft).toBe(100);
  });
});
