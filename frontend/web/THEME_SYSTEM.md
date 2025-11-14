# Theme System Documentation

## Overview

The Stock Trading Platform now features a **unified theme system** with support for both **light and dark modes**. Users can toggle between themes using the sun/moon button in the header, and their preference is automatically saved.

## Architecture

### Components

#### 1. **Theme Configuration Files**

**`src/app/theme/lightTheme.ts`**
- Defines all color values optimized for light mode
- 48+ colors covering primary, secondary, text, backgrounds, forms, and components
- Used when theme is set to "light"

**`src/app/theme/darkTheme.ts`**
- Defines all color values optimized for dark mode
- Adjusted colors for dark backgrounds (lighter blues, darker grays)
- Used when theme is set to "dark"

**`src/app/theme/colors.ts`**
- Central hub for theme management
- Exports both `lightTheme` and `darkTheme`
- Provides `getComponentColors()` function for component-specific color combinations
- Maintains backward compatibility with `COLORS` and `COMPONENT_COLORS`

#### 2. **ThemeProvider Component** (`src/app/theme/ThemeProvider.tsx`)

React Context-based provider that manages theme state globally:

```typescript
// Features:
- useState for current theme (light/dark)
- localStorage persistence (key: "theme")
- System preference detection (prefers-color-scheme)
- useTheme() hook for accessing theme in components
- toggleTheme() function to switch themes
```

#### 3. **Root Layout Integration** (`src/app/layout.tsx`)

The ThemeProvider wraps all child components:

```tsx
<ThemeProvider>
  <Header />
  {children}
</ThemeProvider>
```

## Usage

### Basic Usage in Components

```tsx
import { useTheme } from "../theme/ThemeProvider";

export default function MyComponent() {
  const { name, colors, componentColors, toggleTheme } = useTheme();

  return (
    <div style={{ background: colors.backgroundPrimary, color: colors.textPrimary }}>
      {/* Component using theme colors */}
      <button onClick={toggleTheme}>
        Switch to {name === "light" ? "dark" : "light"} mode
      </button>
    </div>
  );
}
```

### Available Properties from useTheme()

| Property | Type | Description |
|----------|------|-------------|
| `name` | "light" \| "dark" | Current theme name |
| `colors` | Theme | All color definitions for active theme |
| `componentColors` | ComponentColors | Pre-defined component color combinations |
| `toggleTheme()` | Function | Switch between light and dark modes |
| `setTheme()` | Function | Set specific theme ("light" or "dark") |

## Color Palette

### Core Colors

**Primary Colors**
- `primary`: Main action color (blue in both themes)
- `primaryLight`: Light background for primary elements
- `primaryDark`: Darker variant for hover states

**Secondary Colors**
- `secondary`: Success/add color (green)
- `secondaryLight`, `secondaryDark`: Variants

**Status Colors**
- `success`: Success state (green)
- `danger`: Error/delete state (red)
- `warning`: Warning state (orange)

**Text Colors**
- `textPrimary`: Main text color
- `textSecondary`: Secondary text (lighter)
- `textTertiary`: Tertiary text (even lighter)
- `textInverse`: Inverse text (typically white on dark)

**Background Colors**
- `backgroundPrimary`: Main background (white in light, dark gray in dark)
- `backgroundSecondary`: Secondary background
- `backgroundTertiary`: Tertiary background

**Component-Specific Colors**
- `headerBg`, `headerText`: Header styling
- `headerProfileBg`: Profile button background
- `formInputBg`, `formInputBorder`, `formInputText`: Form inputs
- `neutralBorder`: Border colors
- `neutralLight`: Light gray backgrounds

### Component Color Combinations

Accessed via `componentColors`:

```typescript
componentColors.button.primary    // Primary button colors
componentColors.button.secondary  // Secondary button colors
componentColors.button.danger     // Danger button colors
componentColors.alert.success     // Success alert colors
componentColors.alert.error       // Error alert colors
componentColors.input             // Form input colors
componentColors.card              // Card component colors
```

## Theme Persistence

The theme system automatically:

1. **Checks localStorage** for saved preference (key: "theme")
2. **Falls back to system preference** if no saved preference exists
3. **Sets `data-theme` attribute** on the html element
4. **Persists user choice** whenever the theme is toggled

## Integrated Pages

The following pages now use the unified theme system:

- **Header** (`src/app/components/Header.tsx`)
  - Theme toggle button (sun/moon icon)
  - Dynamic colors for all elements
  
- **Dashboard** (`src/app/dashboard/page.tsx`)
  - Summary cards
  - Positions table
  - Recent trades and watchlist
  
- **Profile** (`src/app/profile/page.tsx`)
  - Account information
  - Balances section
  - Trades section
  
- **Login** (`src/app/login/page.tsx`)
  - Form styling with theme colors
  
- **Signup** (`src/app/signup/page.tsx`)
  - Form styling with theme colors

## Light Mode Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Blue | #1e88e5 |
| Secondary | Green | #43a047 |
| Danger | Red | #e53935 |
| Warning | Orange | #fb8c00 |
| Text Primary | Dark Gray | #212121 |
| Background Primary | White | #ffffff |
| Border | Light Gray | #e0e0e0 |

## Dark Mode Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Light Blue | #42a5f5 |
| Secondary | Light Green | #66bb6a |
| Danger | Light Red | #ef5350 |
| Warning | Light Orange | #ffa726 |
| Text Primary | White | #ffffff |
| Background Primary | Dark Gray | #121212 |
| Border | Medium Gray | #424242 |

## Benefits

✅ **User Preference**: Users can choose their preferred theme
✅ **System Integration**: Respects OS dark/light mode preference
✅ **Accessibility**: Improved readability in both modes
✅ **Professional**: Unified, consistent design language
✅ **Maintainability**: Centralized color management
✅ **Performance**: Minimal re-renders with Context API
✅ **Persistence**: Theme choice saved across sessions

## Future Enhancements

Potential improvements:
- CSS variables for CSS-in-JS integration
- Additional theme presets (e.g., high contrast)
- Per-component theme customization
- Smooth transitions between theme switches
- Theme preview before saving
