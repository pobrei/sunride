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
    <header className="sticky top-0 z-30 w-full border-b border-border bg-white dark:bg-zinc-800">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg text-zinc-800 dark:text-white">SunRide</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                pathname === item.href ? 'text-zinc-800 dark:text-white font-medium' : 'text-zinc-600 dark:text-zinc-400'
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
