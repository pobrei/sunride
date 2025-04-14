# Navigation Feature

This folder contains components for navigating the application.

## Components

- `KeyboardNavigation`: Component for handling keyboard navigation.

## Usage

```tsx
import { KeyboardNavigation } from '@/features/navigation/components';

const MyComponent = () => {
  const handleNavigate = (direction: 'left' | 'right' | 'up' | 'down') => {
    console.log(`Navigate ${direction}`);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    console.log(`Zoom ${direction}`);
  };

  const handleSelectMarker = (index: number) => {
    console.log(`Select marker ${index}`);
  };

  return (
    <KeyboardNavigation
      onNavigate={handleNavigate}
      onZoom={handleZoom}
      onSelectMarker={handleSelectMarker}
      markerCount={10}
    />
  );
};
```

## Features

- Keyboard shortcuts for navigation (arrow keys)
- Zoom controls with keyboard shortcuts
- Marker selection with keyboard
- Accessible navigation with ARIA attributes
- Visual indicators for active navigation
- Mobile-friendly touch controls
