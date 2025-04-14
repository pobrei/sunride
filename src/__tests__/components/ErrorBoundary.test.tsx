import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Create a component that throws an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Component', () => {
  // Suppress console errors during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('renders fallback UI when there is an error', () => {
    // We need to spy on console.error and suppress it to avoid test output noise
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    
    spy.mockRestore();
  });
  
  it('resets the error state when the "Try Again" button is clicked', () => {
    // We need to spy on console.error and suppress it to avoid test output noise
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <div>
          <button onClick={() => setShouldThrow(false)}>Fix Error</button>
          <ErrorBoundary>
            {shouldThrow ? (
              <ErrorComponent shouldThrow={true} />
            ) : (
              <div>Error fixed</div>
            )}
          </ErrorBoundary>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Check that the error UI is shown
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Click the "Fix Error" button
    fireEvent.click(screen.getByText('Fix Error'));
    
    // Click the "Try Again" button
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    
    // Check that the error is gone and the component is rendered
    expect(screen.getByText('Error fixed')).toBeInTheDocument();
    
    spy.mockRestore();
  });
});
