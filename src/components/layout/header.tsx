'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud, CloudRain } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * The main header component for the application
 */
export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <CloudRain className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">RideWeather</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/map">Map</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/weather">Weather</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/charts">Charts</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/about">About</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle iconOnly />
        </div>
      </div>
    </header>
  );
}
