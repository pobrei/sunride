'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Heart, Mail } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { typography, animation, effects, layout } from '@shared/styles/tailwind-utils';

interface FooterProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * The main footer component for the application
 */
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'w-full border-t border-border bg-background/95 py-6',
        animation.fadeIn,
        className
      )}
    >
      <div className={cn(layout.container, 'space-y-6')}>
        <div className={cn(layout.flexBetween, 'flex-col md:flex-row gap-4')}>
          <div className="space-y-2">
            <Link href="/" className={cn(layout.flexRow, 'gap-2', animation.linkHover)}>
              <span className={cn(typography.h5)}>RideWeather</span>
            </Link>
            <p className={cn(typography.bodySm, typography.muted)}>
              Plan your routes with detailed weather forecasts
            </p>
          </div>

          <nav className={cn(layout.flexRow, 'gap-6')}>
            <Link 
              href="/" 
              className={cn(typography.bodySm, typography.link, animation.hoverLiftSm)}
            >
              Home
            </Link>
            <Link 
              href="/map" 
              className={cn(typography.bodySm, typography.link, animation.hoverLiftSm)}
            >
              Map
            </Link>
            <Link 
              href="/weather" 
              className={cn(typography.bodySm, typography.link, animation.hoverLiftSm)}
            >
              Weather
            </Link>
            <Link 
              href="/charts" 
              className={cn(typography.bodySm, typography.link, animation.hoverLiftSm)}
            >
              Charts
            </Link>
            <Link 
              href="/about" 
              className={cn(typography.bodySm, typography.link, animation.hoverLiftSm)}
            >
              About
            </Link>
          </nav>
        </div>

        <div className={cn(effects.borderTop, 'pt-6')}>
          <div className={cn(layout.flexBetween, 'flex-col md:flex-row gap-4')}>
            <div className={cn(layout.flexRow, 'gap-4')}>
              <a 
                href="https://github.com/pobrei/sunride" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(layout.flexRow, 'gap-2', animation.hoverLiftSm)}
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@example.com" 
                className={cn(layout.flexRow, 'gap-2', animation.hoverLiftSm)}
                aria-label="Contact Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            <p className={cn(typography.bodySm, typography.muted)}>
              &copy; {currentYear} RideWeather. Made with <Heart className="inline-block h-3 w-3 text-red-500" /> by Pobrei
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
