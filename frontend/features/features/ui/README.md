# UI Feature

This folder contains utilities and components for the user interface.

## Utils

- `cn.ts`: Utility for merging Tailwind CSS classes with clsx

## Usage

```tsx
import { cn } from '@/features/ui';

const className = cn(
  'text-lg font-bold',
  isActive && 'text-primary',
  isDisabled && 'opacity-50 cursor-not-allowed'
);
```

## Features

- Merging of Tailwind CSS classes
- Conditional class application
- Deduplication of conflicting classes
