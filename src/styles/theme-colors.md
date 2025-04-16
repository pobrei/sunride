# Theme Colors Usage Guide

This guide demonstrates how to use the new theme colors in your components.

## Available Colors

The following theme colors are available:

- `theme.bg` - Background color
- `theme.text` - Text color
- `theme.accent` - Accent color
- `theme.card` - Card background color
- `theme.shadow` - Shadow color

## Using in Tailwind Classes

You can use these colors in your Tailwind classes:

```jsx
// Background colors
<div className="bg-theme-bg">Background</div>
<div className="bg-theme-card">Card Background</div>
<div className="bg-theme-accent">Accent Background</div>

// Text colors
<p className="text-theme-text">Text</p>
<p className="text-theme-accent">Accent Text</p>

// Border colors
<div className="border border-theme-text">Border</div>
<div className="border border-theme-accent">Accent Border</div>

// Shadows
<div className="shadow-md shadow-theme-shadow">Shadow</div>
```

## Using with the themeColors Utility

You can also use the `themeColors` utility from `src/utils/formatters.ts`:

```jsx
import { themeColors } from '@/utils/formatters';

// Using the CSS variables directly
<div style={{ backgroundColor: themeColors.bg }}>Background</div>
<div style={{ color: themeColors.text }}>Text</div>

// Using the Tailwind class mappings
<div className={themeColors.classes.bg}>Background</div>
<div className={themeColors.classes.text}>Text</div>
<div className={themeColors.classes.card}>Card</div>
<div className={themeColors.classes.button}>Button</div>
<div className={themeColors.classes.input}>Input</div>
```

## Dark Mode Support

The theme colors automatically adapt to dark mode when:

1. The user's system is set to dark mode (via `prefers-color-scheme: dark`)
2. The `dark` class is added to the `html` element (via next-themes)

No additional configuration is needed for dark mode support.
