'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import { cn } from '@shared/lib/utils';
import { animation, effects } from '@shared/styles/tailwind-utils';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isMounted, setIsMounted] = useState(false);

  // When mounted on client, get the theme from localStorage if available
  useEffect(() => {
    setIsMounted(true);

    // Only run on client-side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Check system preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        setTheme(systemTheme);
      }
    }
  }, []);

  // Update the theme when it changes
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const root = document.documentElement;

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme, isMounted]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full",
        animation.transition,
        effects.hover
      )}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className={cn("h-5 w-5 text-yellow-400", animation.spin)} />
      ) : (
        <Moon className={cn("h-5 w-5 text-primary", animation.transition)} />
      )}
    </Button>
  );
}
