/**
 * Utility function to generate a CSS class for a dynamic height
 * @param height The height in pixels
 * @returns A CSS class name for the height
 */
export function getDynamicHeightClass(height: number): string {
  // For common heights, return predefined Tailwind classes
  switch (height) {
    case 0: return 'h-0';
    case 1: return 'h-px';
    case 2: return 'h-0.5';
    case 4: return 'h-1';
    case 6: return 'h-1.5';
    case 8: return 'h-2';
    case 10: return 'h-2.5';
    case 12: return 'h-3';
    case 14: return 'h-3.5';
    case 16: return 'h-4';
    case 20: return 'h-5';
    case 24: return 'h-6';
    case 28: return 'h-7';
    case 32: return 'h-8';
    case 36: return 'h-9';
    case 40: return 'h-10';
    case 44: return 'h-11';
    case 48: return 'h-12';
    case 56: return 'h-14';
    case 64: return 'h-16';
    case 80: return 'h-20';
    case 96: return 'h-24';
    case 112: return 'h-28';
    case 128: return 'h-32';
    case 144: return 'h-36';
    case 160: return 'h-40';
    case 176: return 'h-44';
    case 192: return 'h-48';
    case 208: return 'h-52';
    case 224: return 'h-56';
    case 240: return 'h-60';
    case 256: return 'h-64';
    case 288: return 'h-72';
    case 320: return 'h-80';
    case 384: return 'h-96';
    default: return `h-[${height}px]`;
  }
}

/**
 * Utility function to generate a CSS class for a dynamic top position
 * @param top The top position in pixels
 * @returns A CSS class name for the top position
 */
export function getDynamicTopClass(top: number): string {
  // For common positions, return predefined Tailwind classes
  switch (top) {
    case 0: return 'top-0';
    case 1: return 'top-px';
    case 2: return 'top-0.5';
    case 4: return 'top-1';
    case 6: return 'top-1.5';
    case 8: return 'top-2';
    case 10: return 'top-2.5';
    case 12: return 'top-3';
    case 14: return 'top-3.5';
    case 16: return 'top-4';
    case 20: return 'top-5';
    case 24: return 'top-6';
    case 28: return 'top-7';
    case 32: return 'top-8';
    case 36: return 'top-9';
    case 40: return 'top-10';
    case 44: return 'top-11';
    case 48: return 'top-12';
    case 56: return 'top-14';
    case 64: return 'top-16';
    case 80: return 'top-20';
    case 96: return 'top-24';
    case 112: return 'top-28';
    case 128: return 'top-32';
    case 144: return 'top-36';
    case 160: return 'top-40';
    case 176: return 'top-44';
    case 192: return 'top-48';
    case 208: return 'top-52';
    case 224: return 'top-56';
    case 240: return 'top-60';
    case 256: return 'top-64';
    case 288: return 'top-72';
    case 320: return 'top-80';
    case 384: return 'top-96';
    default: return `top-[${top}px]`;
  }
}
