'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Map, BarChart, Cloud, Settings, Info, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  /** Optional className for styling */
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

/**
 * A mobile navigation component with a slide-out menu
 */
export function MobileNav({ className }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: 'Map',
      href: '/map',
      icon: <Map className="h-5 w-5" />,
    },
    {
      label: 'Weather',
      href: '/weather',
      icon: <Cloud className="h-5 w-5" />,
    },
    {
      label: 'Charts',
      href: '/charts',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      label: 'About',
      href: '/about',
      icon: <Info className="h-5 w-5" />,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('md:hidden', className)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center justify-between">
            <span className="font-bold text-lg">RideWeather</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted/50'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 px-4 pt-4 border-t border-border">
            <ThemeToggle className="w-full justify-start" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
