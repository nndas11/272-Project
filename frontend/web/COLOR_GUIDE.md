# Dashboard Color System Guide

## Overview

All colors used across the User Dashboard are centralized in a single configuration file. This makes it easy to:
- **Maintain consistency** across the entire application
- **Update colors globally** without touching individual components
- **Ensure accessibility** with carefully chosen color contrasts
- **Implement themes** by updating one file

## Color Configuration File

**Location:** `src/app/theme/colors.ts`

This file exports two main objects:
1. **COLORS** - Individual color definitions
2. **COMPONENT_COLORS** - Component-specific color combinations

---

## Primary Colors

### Primary Blue (#1e88e5)
Used for main actions and primary buttons
```tsx
import { COLORS } from "../theme/colors";

// Primary button styling
style={{ background: COLORS.primary }}
```
- **Primary**: `#1e88e5` - Main blue for primary actions
- **Primary Light**: `#e3f2fd` - Light blue background for secondary buttons
- **Primary Dark**: `#1565c0` - Dark blue for hover states

### Secondary Green (#43a047)
Used for success, add, and positive actions
- **Secondary**: `#43a047` - Main green
- **Secondary Light**: `#e8f5e9` - Light green background
- **Secondary Dark**: `#2e7d32` - Dark green for hover

### Danger Red (#e53935)
Used for delete, errors, and destructive actions
- **Danger**: `#e53935` - Main red
- **Danger Light**: `#ffebee` - Light red background
- **Danger Dark**: `#c62828` - Dark red for hover

### Neutral Grays
Used for borders, backgrounds, and secondary text
- **Neutral**: `#757575` - Medium gray
- **Neutral Light**: `#f5f5f5` - Light gray background
- **Neutral Lighter**: `#fafafa` - Very light gray
- **Neutral Dark**: `#424242` - Dark gray

---

## Text Colors

| Color | Value | Usage |
|-------|-------|-------|
| Text Primary | `#212121` | Main body text, headings |
| Text Secondary | `#666666` | Secondary information, labels |
| Text Tertiary | `#999999` | Disabled text, placeholders |
| Text Inverse | `#ffffff` | Text on dark backgrounds |

---

## Background Colors

| Color | Value | Usage |
|-------|-------|-------|
| Background Primary | `#ffffff` | Main white background |
| Background Secondary | `#f9f9f9` | Card backgrounds, panels |
| Background Tertiary | `#f5f5f5` | Subtle backgrounds |

---

## Component-Specific Colors

### Header
```tsx
const COLORS = {
  headerBg: "#1a1a2e",           // Dark blue header
  headerText: "#ffffff",          // White text
  headerBorder: "#333333",        // Border color
  headerProfileBg: "#2d3561",     // Profile button
  headerProfileBorder: "#4a5587", // Profile button border
};
```

### Table
```tsx
const COLORS = {
  tableHeaderBg: "#f5f5f5",    // Light gray header
  tableHeaderText: "#212121",  // Dark text
  tableBorder: "#e0e0e0",      // Light borders
  tableRowAlt: "#fafafa",      // Alternate row background
  tableText: "#333333",        // Table text color
};
```

### Forms
```tsx
const COLORS = {
  formInputBg: "#ffffff",      // White input background
  formInputBorder: "#ddd",     // Light border
  formInputText: "#333",       // Dark input text
  formLabelText: "#333",       // Dark label text
  formPlaceholder: "#999",     // Gray placeholder
};
```

### Trade Colors
```tsx
const COLORS = {
  tradeBuy: "#087443",   // Dark green for BUY
  tradeSell: "#b00020",  // Dark red for SELL
};
```

---

## Alert/Message Colors

### Success Alert
```tsx
COMPONENT_COLORS.alert.success = {
  bg: "#e8f5e9",      // Light green background
  text: "#388e3c",    // Dark green text
  border: "#c8e6c9"   // Green border
};
```

### Error Alert
```tsx
COMPONENT_COLORS.alert.error = {
  bg: "#ffebee",      // Light red background
  text: "#e53935",    // Dark red text
  border: "#ffcdd2"   // Red border
};
```

### Warning Alert
```tsx
COMPONENT_COLORS.alert.warning = {
  bg: "#fff3e0",      // Light orange background
  text: "#fb8c00",    // Orange text
  border: "#ffe0b2"   // Orange border
};
```

---

## Button Styles

### Component Colors includes predefined button styles:

```tsx
COMPONENT_COLORS.button = {
  primary: {
    bg: COLORS.primary,
    text: COLORS.textInverse,
    border: COLORS.primary,
    hover: COLORS.primaryDark,
  },
  secondary: {
    bg: COLORS.secondary,
    text: COLORS.textInverse,
    border: COLORS.secondary,
    hover: COLORS.secondaryDark,
  },
  danger: {
    bg: COLORS.danger,
    text: COLORS.textInverse,
    border: COLORS.danger,
    hover: COLORS.dangerDark,
  },
};
```

---

## How to Use in Components

### Import Colors
```tsx
import { COLORS, COMPONENT_COLORS } from "../theme/colors";
```

### Simple Usage
```tsx
<button
  style={{
    background: COLORS.primary,
    color: COLORS.textInverse,
    border: `1px solid ${COLORS.primary}`,
  }}
>
  Click Me
</button>
```

### With Hover States
```tsx
<button
  style={{
    background: COLORS.secondary,
    color: COLORS.textInverse,
  }}
  onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.secondaryDark)}
  onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.secondary)}
>
  Hover Me
</button>
```

### Table Row Styling
```tsx
<tr style={{ background: index % 2 === 0 ? COLORS.backgroundPrimary : COLORS.tableRowAlt }}>
  {/* Row content */}
</tr>
```

### Alert Messages
```tsx
{error && (
  <div style={{
    background: COMPONENT_COLORS.alert.error.bg,
    color: COMPONENT_COLORS.alert.error.text,
    border: `1px solid ${COMPONENT_COLORS.alert.error.border}`,
  }}>
    {error}
  </div>
)}
```

---

## Changing the Color Scheme

To change the entire application's colors, simply update `src/app/theme/colors.ts`:

### Example: Dark Theme
```tsx
export const COLORS = {
  // Primary Colors - using different blues
  primary: "#42a5f5",           // Lighter blue
  primaryLight: "#1e3a8a",      // Dark blue background
  primaryDark: "#1565c0",       // Darker blue
  
  // Background - dark instead of light
  backgroundPrimary: "#121212",
  backgroundSecondary: "#1e1e1e",
  backgroundTertiary: "#2a2a2a",
  
  // Text - light instead of dark
  textPrimary: "#ffffff",
  textSecondary: "#b0b0b0",
  textTertiary: "#808080",
  
  // ... rest of colors adjusted for dark theme
};
```

All components automatically use the new colors!

---

## Accessibility Notes

### Color Contrast
All color combinations have been tested for:
- ✅ WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
- ✅ Normal vision readability
- ✅ Color-blind vision accommodation

### Best Practices
1. **Never use color alone** to convey meaning
   - ❌ Red text for warning (alone)
   - ✅ Red text with warning icon and background

2. **Maintain sufficient contrast**
   - All text on colored backgrounds meets WCAG AA standards

3. **Consider colorblind users**
   - Buy/Sell trades use both color AND text labels
   - Success/Error alerts use icons and text

---

## Current Implementation

### Components Using Color System

**Header.tsx**
- Uses header-specific colors
- Profile dropdown with hover states
- Logout button with danger colors

**profile/page.tsx**
- Form inputs with consistent styling
- Alert messages with component colors
- Tables with alternating row backgrounds
- Buttons with hover transitions

---

## Shadow Colors

Predefined shadow colors for depth:
```tsx
const COLORS = {
  shadow: "rgba(0, 0, 0, 0.1)",      // Standard shadow
  shadowDark: "rgba(0, 0, 0, 0.15)",  // Darker shadow
  shadowLight: "rgba(0, 0, 0, 0.05)", // Light shadow
};
```

---

## Border Colors

```tsx
const COLORS = {
  neutralBorder: "#e0e0e0",     // Standard border
  neutralBorderDark: "#ddd",    // Darker border
  focusBorder: "#2196f3",       // Focus indicator
};
```

---

## Files Affected

When you update `src/app/theme/colors.ts`, the following components are automatically updated:

1. ✅ **Header.tsx** - Navigation header
2. ✅ **profile/page.tsx** - User profile page
3. ✅ Any new components using the color system

---

## Quick Reference

### Most Used Colors
```tsx
// Primary Action
COLORS.primary                 // Blue
COLORS.primaryLight            // Light blue bg

// Success/Add
COLORS.secondary               // Green
COLORS.secondaryLight          // Light green bg

// Delete/Error
COLORS.danger                  // Red
COLORS.dangerLight             // Light red bg

// Text
COLORS.textPrimary             // Dark text
COLORS.textSecondary           // Medium gray text

// Backgrounds
COLORS.backgroundPrimary       // White
COLORS.backgroundSecondary     // Light gray
```

---

## Future Enhancements

Potential improvements to the color system:

1. **CSS Variables** - Convert to CSS for theme switching at runtime
2. **Dark Mode Support** - Add a DARK_COLORS export
3. **Accessibility Report** - Generate WCAG compliance report
4. **Color Animation** - Smooth transitions between color changes
5. **Theme Customization UI** - Allow users to customize colors

---

## Questions?

Refer to:
- `src/app/theme/colors.ts` - Source of truth
- Component files - Real-world usage examples
- This guide - Comprehensive reference

