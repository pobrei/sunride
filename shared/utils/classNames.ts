import { cn } from '@shared/lib/utils';

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes properly.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicting Tailwind classes.
 *
 * @param inputs - Class names to combine
 * @returns Merged class string
 *
 * @example
 * // Returns "p-4 bg-blue-500" (not "p-2 p-4 bg-blue-500")
 * classNames("p-2", "p-4 bg-blue-500")
 *
 * // Conditional classes
 * classNames("p-2", { "bg-blue-500": isActive, "bg-gray-200": !isActive })
 */
export const classNames = cn;

// Export the original function name for backward compatibility
export { cn };
