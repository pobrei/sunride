/**
 * Framer Motion animation variants and utilities
 */
import { Variants } from 'framer-motion';

/**
 * Fade in animation variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

/**
 * Fade in and slide up animation variants
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

/**
 * Fade in and slide down animation variants
 */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

/**
 * Fade in and slide from left animation variants
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

/**
 * Fade in and slide from right animation variants
 */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

/**
 * Scale animation variants
 */
export const scale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

/**
 * Staggered children animation variants
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  }
};

/**
 * Hover animation variants
 */
export const hoverScale = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } }
};

/**
 * Subtle hover animation variants
 */
export const subtleHover = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.99, transition: { duration: 0.1 } }
};

/**
 * Button press animation variants
 */
export const buttonPress = {
  hover: { scale: 1.03, transition: { duration: 0.2 } },
  tap: { scale: 0.97, transition: { duration: 0.1 } }
};

/**
 * Pulse animation variants
 */
export const pulse: Variants = {
  hidden: { opacity: 0.6, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1.5,
      ease: 'easeInOut'
    }
  }
};

/**
 * Shimmer animation variants
 */
export const shimmer: Variants = {
  hidden: { opacity: 0.4, x: -100 },
  visible: {
    opacity: 1,
    x: 100,
    transition: {
      repeat: Infinity,
      repeatType: 'loop',
      duration: 1.5,
      ease: 'linear'
    }
  }
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.3,
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

/**
 * Transition presets
 */
export const transitions = {
  default: { duration: 0.3, ease: 'easeInOut' },
  slow: { duration: 0.6, ease: 'easeInOut' },
  fast: { duration: 0.15, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  bounce: { type: 'spring', stiffness: 300, damping: 10 },
};
