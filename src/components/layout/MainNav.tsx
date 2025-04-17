'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { EnhancedThemeToggle } from '@/components/ui/enhanced-theme-toggle';

/**
 * Main navigation component for the application
 */
export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/design-system', label: 'Design System' },
    { href: '/enhanced-visualization', label: 'Enhanced Visualization' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 container-transition">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">RideWeather</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === item.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <EnhancedThemeToggle />
        </div>
      </div>
    </header>
  );
}
