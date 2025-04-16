'use client';

import { themeColors } from '@/utils/formatters';

/**
 * Example component demonstrating the use of theme colors
 * This is just for demonstration purposes and can be removed
 */
export function ThemeColorsExample() {
  return (
    <div className="p-4 bg-theme-bg rounded-lg">
      <h2 className="text-xl font-bold text-theme-text mb-4">Theme Colors Example</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-theme-card rounded-lg shadow-sm">
          <h3 className="font-medium text-theme-text mb-2">Card with Theme Colors</h3>
          <p className="text-sm text-theme-text/80">
            This card uses theme.card for background and theme.text for text color.
          </p>
          <button className="mt-3 px-3 py-1.5 bg-theme-accent text-white rounded-md">
            Accent Button
          </button>
        </div>
        
        <div className="p-4 border border-theme-text/20 rounded-lg">
          <h3 className="font-medium text-theme-text mb-2">Border Example</h3>
          <p className="text-sm text-theme-text/80">
            This card uses a border with theme.text at 20% opacity.
          </p>
          <div className="mt-3 h-2 bg-theme-accent rounded-full"></div>
        </div>
      </div>
      
      <div className="p-4 bg-theme-bg border border-theme-text/10 rounded-lg">
        <h3 className="font-medium text-theme-text mb-2">Using themeColors Utility</h3>
        <div className="flex flex-wrap gap-2">
          <span 
            className="inline-block px-3 py-1 rounded-full text-xs"
            style={{ backgroundColor: themeColors.accent, color: themeColors.card }}
          >
            Accent Tag
          </span>
          <span 
            className="inline-block px-3 py-1 rounded-full text-xs"
            style={{ backgroundColor: themeColors.card, color: themeColors.text, boxShadow: themeColors.shadow }}
          >
            Card Tag
          </span>
          <span 
            className="inline-block px-3 py-1 rounded-full text-xs"
            style={{ backgroundColor: themeColors.text, color: themeColors.card }}
          >
            Text Tag
          </span>
        </div>
      </div>
    </div>
  );
}
