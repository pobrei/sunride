'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showTooltip?: boolean;
}

/**
 * A theme toggle component - Flat Design (no animations)
 */
export function EnhancedThemeToggle({
  className,
  variant = 'ghost',
  size = 'icon',
  showTooltip = true,
}: EnhancedThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('relative', className)}
        disabled
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5 bg-muted-foreground/20" />
      </Button>
    );
  }

  const Icon = theme === 'dark' ? Sun : Moon;
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn('relative', className)}
      aria-label={label}
    >
      <div key={theme}>
        <Icon className={cn(
          'h-[1.2rem] w-[1.2rem]',
          theme === 'dark' ? 'text-white' : 'text-black'
        )} />
      </div>
    </Button>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
