'use client';

import React from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MotionComponentProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scale' | 'none';
  delay?: number;
  duration?: number;
  as?: React.ElementType;
  once?: boolean;
  amount?: number | 'some' | 'all';
}

/**
 * A wrapper component for Framer Motion animations - Flat Design Version
 * In flat design, we don't use animations, so this just renders the children
 */
export function MotionDiv({
  children,
  className,
  variant = 'none',
  as = 'div',
  ...props
}: MotionComponentProps) {
  // In flat design, we don't use animations
  const variants: Record<string, Variants> = {
    fadeIn: {
      hidden: {},
      visible: {}
    },
    fadeInUp: {
      hidden: {},
      visible: {}
    },
    fadeInDown: {
      hidden: {},
      visible: {}
    },
    fadeInLeft: {
      hidden: {},
      visible: {}
    },
    fadeInRight: {
      hidden: {},
      visible: {}
    },
    scale: {
      hidden: {},
      visible: {}
    },
    none: {
      hidden: {},
      visible: {}
    }
  };

  const Component = motion[as as keyof typeof motion] || motion.div;

  // Just render the component without animations
  return (
    <Component
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * A motion component that fades in
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: Omit<MotionComponentProps, 'variant'>) {
  return (
    <MotionDiv
      className={className}
      variant="fadeIn"
      delay={delay}
      duration={duration}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}

/**
 * A motion component that fades in and slides up
 */
export function FadeInUp({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: Omit<MotionComponentProps, 'variant'>) {
  return (
    <MotionDiv
      className={className}
      variant="fadeInUp"
      delay={delay}
      duration={duration}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}

/**
 * A motion component that fades in and slides down
 */
export function FadeInDown({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: Omit<MotionComponentProps, 'variant'>) {
  return (
    <MotionDiv
      className={className}
      variant="fadeInDown"
      delay={delay}
      duration={duration}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}

/**
 * A motion component that fades in and slides from the left
 */
export function FadeInLeft({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: Omit<MotionComponentProps, 'variant'>) {
  return (
    <MotionDiv
      className={className}
      variant="fadeInLeft"
      delay={delay}
      duration={duration}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}

/**
 * A motion component that fades in and slides from the right
 */
export function FadeInRight({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: Omit<MotionComponentProps, 'variant'>) {
  return (
    <MotionDiv
      className={className}
      variant="fadeInRight"
      delay={delay}
      duration={duration}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}

/**
 * A motion component that scales in
 */
export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}: Omit<MotionComponentProps, 'variant'>) {
  return (
    <MotionDiv
      className={className}
      variant="scale"
      delay={delay}
      duration={duration}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}

/**
 * A motion component for staggered children animations - Flat Design Version
 * In flat design, we don't use staggered animations
 */
export function StaggerContainer({
  children,
  className,
  ...props
}: Omit<MotionComponentProps, 'variant' | 'duration'> & { staggerDelay?: number }) {
  return (
    <motion.div
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * A motion component for hover animations - Flat Design Version
 * In flat design, we don't use hover animations
 */
export function HoverMotion({
  children,
  className,
  ...props
}: Omit<MotionComponentProps, 'variant' | 'delay' | 'duration' | 'once' | 'amount'> & { scale?: number }) {
  return (
    <motion.div
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
