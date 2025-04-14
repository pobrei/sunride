import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardNavigation } from '@/features/navigation/components';

describe('KeyboardNavigation Component', () => {
  const mockOnNavigate = jest.fn();
  const mockOnZoom = jest.fn();
  const mockOnSelectMarker = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly', () => {
    render(
      <KeyboardNavigation
        onNavigate={mockOnNavigate}
        onZoom={mockOnZoom}
        onSelectMarker={mockOnSelectMarker}
        markerCount={5}
      />
    );
    
    // Check if the component renders
    expect(screen.getByTestId('keyboard-navigation')).toBeInTheDocument();
  });
  
  it('calls onNavigate when arrow keys are pressed', () => {
    render(
      <KeyboardNavigation
        onNavigate={mockOnNavigate}
        onZoom={mockOnZoom}
        onSelectMarker={mockOnSelectMarker}
        markerCount={5}
      />
    );
    
    // Simulate arrow key presses
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockOnNavigate).toHaveBeenCalledWith('left');
    
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockOnNavigate).toHaveBeenCalledWith('right');
    
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(mockOnNavigate).toHaveBeenCalledWith('up');
    
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(mockOnNavigate).toHaveBeenCalledWith('down');
  });
  
  it('calls onZoom when plus/minus keys are pressed', () => {
    render(
      <KeyboardNavigation
        onNavigate={mockOnNavigate}
        onZoom={mockOnZoom}
        onSelectMarker={mockOnSelectMarker}
        markerCount={5}
      />
    );
    
    // Simulate plus/minus key presses
    fireEvent.keyDown(document, { key: '+' });
    expect(mockOnZoom).toHaveBeenCalledWith('in');
    
    fireEvent.keyDown(document, { key: '-' });
    expect(mockOnZoom).toHaveBeenCalledWith('out');
  });
  
  it('calls onSelectMarker when number keys are pressed', () => {
    render(
      <KeyboardNavigation
        onNavigate={mockOnNavigate}
        onZoom={mockOnZoom}
        onSelectMarker={mockOnSelectMarker}
        markerCount={5}
      />
    );
    
    // Simulate number key presses
    fireEvent.keyDown(document, { key: '1' });
    expect(mockOnSelectMarker).toHaveBeenCalledWith(0);
    
    fireEvent.keyDown(document, { key: '3' });
    expect(mockOnSelectMarker).toHaveBeenCalledWith(2);
    
    // Should not call for numbers greater than markerCount
    fireEvent.keyDown(document, { key: '6' });
    expect(mockOnSelectMarker).not.toHaveBeenCalledWith(5);
  });
  
  it('does not call handlers for unrelated keys', () => {
    render(
      <KeyboardNavigation
        onNavigate={mockOnNavigate}
        onZoom={mockOnZoom}
        onSelectMarker={mockOnSelectMarker}
        markerCount={5}
      />
    );
    
    // Simulate unrelated key press
    fireEvent.keyDown(document, { key: 'a' });
    expect(mockOnNavigate).not.toHaveBeenCalled();
    expect(mockOnZoom).not.toHaveBeenCalled();
    expect(mockOnSelectMarker).not.toHaveBeenCalled();
  });
  
  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <KeyboardNavigation
        onNavigate={mockOnNavigate}
        onZoom={mockOnZoom}
        onSelectMarker={mockOnSelectMarker}
        markerCount={5}
      />
    );
    
    // Unmount the component
    unmount();
    
    // Simulate key press after unmount
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockOnNavigate).not.toHaveBeenCalled();
  });
});
