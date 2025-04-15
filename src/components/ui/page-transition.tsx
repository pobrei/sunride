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
 * A component that adds page transitions
 */
export function PageTransition({
  children,
  className,
  mode = 'wait',
}: PageTransitionProps) {
  return (
    <AnimatePresence mode={mode}>
      <motion.div
        className={cn(className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * A component that adds fade transitions
 */
export function FadeTransition({
  children,
  className,
  duration = 0.3,
}: PageTransitionProps & { duration?: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={cn(className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * A component that adds slide transitions
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
  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  const initial = directionMap[direction];
  const exit = {
    ...directionMap[
      direction === 'up' 
        ? 'down' 
        : direction === 'down' 
        ? 'up' 
        : direction === 'left' 
        ? 'right' 
        : 'left'
    ],
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={cn(className)}
        initial={{ opacity: 0, ...initial }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, ...exit }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * A component that adds scale transitions
 */
export function ScaleTransition({
  children,
  className,
  duration = 0.4,
}: PageTransitionProps & { duration?: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={cn(className)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
