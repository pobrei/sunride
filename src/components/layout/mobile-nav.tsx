'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Map, BarChart, Cloud, Settings, Info, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EnhancedThemeToggle } from '@/components/ui/enhanced-theme-toggle';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';

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

  const navItems: NavItem[] = [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('md:hidden', animation.buttonPress, effects.buttonHover, className)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className={cn("p-0", animation.fadeInSlideUp)}>
        <SheetHeader className={cn("p-4", effects.borderBottom)}>
          <SheetTitle className={cn(layout.flexBetween)}>
            <span className={cn(typography.h5)}>SunRide</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className={cn("h-8 w-8", animation.buttonPress, effects.buttonHover)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className={cn("py-4", animation.fadeIn)}>
          <nav className={cn("space-y-1")}>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  layout.flexRow,
                  typography.bodySm,
                  typography.strong,
                  animation.transition,
                  'gap-3 px-4 py-3',
                  item.active
                    ? 'bg-accent text-accent-foreground'
                    : cn(effects.hoverSubtle, animation.hoverLiftSm)
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={cn("mt-6 px-4 pt-4", effects.borderTop)}>
            <EnhancedThemeToggle className="w-full justify-start" size="default" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
