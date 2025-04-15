'use client';

import React from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';
import { cn } from '@shared/lib/utils';

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
 * A wrapper component for Framer Motion animations
 */
export function MotionDiv({
  children,
  className,
  variant = 'fadeIn',
  delay = 0,
  duration = 0.5,
  as = 'div',
  once = true,
  amount = 0.3,
  ...props
}: MotionComponentProps) {
  // Define animation variants
  const variants: Record<string, Variants> = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration,
          delay,
          ease: 'easeOut'
        }
      }
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration,
          delay,
          ease: 'easeOut'
        }
      }
    },
    fadeInDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration,
          delay,
          ease: 'easeOut'
        }
      }
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration,
          delay,
          ease: 'easeOut'
        }
      }
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration,
          delay,
          ease: 'easeOut'
        }
      }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration,
          delay,
          ease: [0.175, 0.885, 0.32, 1]
        }
      }
    },
    none: {
      hidden: {},
      visible: {}
    }
  };

  const Component = motion[as as keyof typeof motion] || motion.div;

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants[variant]}
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
 * A motion component for staggered children animations
 */
export function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
  ...props
}: Omit<MotionComponentProps, 'variant' | 'duration'> & { staggerDelay?: number }) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delay,
            staggerChildren: staggerDelay,
            delayChildren: delay,
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * A motion component for hover animations
 */
export function HoverMotion({
  children,
  className,
  scale = 1.05,
  ...props
}: Omit<MotionComponentProps, 'variant' | 'delay' | 'duration' | 'once' | 'amount'> & { scale?: number }) {
  return (
    <motion.div
      className={cn(className)}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
