/**
 * Unified Theme System
 * Exports light and dark themes with dynamic switching
 */

import { lightTheme } from "./lightTheme";
import { darkTheme } from "./darkTheme";

// Export individual themes
export { lightTheme, darkTheme };

// Type for theme
export type Theme = typeof lightTheme;

// Component-specific color combinations (will use current theme)
export const getComponentColors = (theme: Theme) => ({
  button: {
    primary: {
      bg: theme.primary,
      text: theme.textInverse,
      border: theme.primary,
      hover: theme.primaryDark,
    },
    secondary: {
      bg: theme.secondary,
      text: theme.textInverse,
      border: theme.secondary,
      hover: theme.secondaryDark,
    },
    tertiary: {
      bg: theme.neutralLight,
      text: theme.textPrimary,
      border: theme.neutralBorder,
      hover: theme.neutralBorderDark,
    },
    danger: {
      bg: theme.danger,
      text: theme.textInverse,
      border: theme.danger,
      hover: theme.dangerDark,
    },
  },
  alert: {
    success: {
      bg: theme.successLight,
      text: theme.success,
      border: theme.success,
    },
    error: {
      bg: theme.dangerLight,
      text: theme.danger,
      border: theme.danger,
    },
    warning: {
      bg: theme.warningLight,
      text: theme.warning,
      border: theme.warning,
    },
  },
  input: {
    bg: theme.formInputBg,
    border: theme.formInputBorder,
    text: theme.formInputText,
    focus: theme.focusBorder,
  },
  card: {
    bg: theme.backgroundPrimary,
    border: theme.neutralBorder,
    text: theme.textPrimary,
  },
});

// For backwards compatibility - default export with light theme
export const COLORS = lightTheme;
export const COMPONENT_COLORS = getComponentColors(lightTheme);
