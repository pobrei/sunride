'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  mode?: 'wait' | 'sync' | 'popLayout';
}

/**
 * A component that adds page transitions - Flat Design (no animations)
 */
export function PageTransition({
  children,
  className,
  mode = 'wait',
}: PageTransitionProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

/**
 * A component that adds fade transitions - Flat Design (no animations)
 */
export function FadeTransition({
  children,
  className,
  duration = 0.3,
}: PageTransitionProps & { duration?: number }) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

/**
 * A component that adds slide transitions - Flat Design (no animations)
 */
export function SlideTransition({
  children,
  className,
  direction = 'up',
  distance = 20,
  duration = 0.4,
}: PageTransitionProps & {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

/**
 * A component that adds scale transitions - Flat Design (no animations)
 */
export function ScaleTransition({
  children,
  className,
  duration = 0.4,
}: PageTransitionProps & { duration?: number }) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}
