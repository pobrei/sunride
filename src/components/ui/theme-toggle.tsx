'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  /** Optional className for styling */
  className?: string;
  /** Whether to use a smaller variant */
  small?: boolean;
  /** Whether to show the icon only */
  iconOnly?: boolean;
}

/**
 * A button that toggles between light and dark mode
 */
export function ThemeToggle({ className, small = false, iconOnly = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={small ? 'sm' : 'default'}
        className={cn('gap-2 transition-opacity opacity-0', iconOnly && 'px-0 w-9', className)}
        aria-label="Toggle theme"
      >
        <Sun className={small ? 'h-4 w-4' : 'h-5 w-5'} />
        {!iconOnly && <span>Theme</span>}
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size={small ? 'sm' : 'default'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn('gap-2 transition-all', iconOnly && 'px-0 w-9', className)}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun className={cn('transition-transform', small ? 'h-4 w-4' : 'h-5 w-5')} />
      ) : (
        <Moon className={cn('transition-transform', small ? 'h-4 w-4' : 'h-5 w-5')} />
      )}
      {!iconOnly && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
    </Button>
  );
}
