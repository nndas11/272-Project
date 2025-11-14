# Theme System - Quick Start Guide

## 🎨 What Was Implemented

Your Stock Trading Platform now has a complete **unified light and dark theme system** with automatic user preference persistence.

## 🚀 How to Use

### For Users
1. Look for the **sun/moon button** in the top right of the header (next to profile)
2. Click it to toggle between **light** (☀️) and **dark** (🌙) modes
3. Your preference is **automatically saved**
4. The app will remember your choice when you return

### For Developers

#### Using Theme in Components
```tsx
import { useTheme } from "../theme/ThemeProvider";

export default function MyComponent() {
  const { name, colors, componentColors, toggleTheme } = useTheme();
  
  return (
    <div style={{ background: colors.backgroundPrimary, color: colors.textPrimary }}>
      <button onClick={toggleTheme}>
        Switch to {name === "light" ? "dark" : "light"} mode
      </button>
    </div>
  );
}
```

#### Available Colors
```typescript
// Basic colors
colors.primary              // Main blue
colors.secondary            // Green
colors.danger               // Red
colors.warning              // Orange

// Text colors
colors.textPrimary          // Main text
colors.textSecondary        // Secondary text
colors.textInverse          // White text on dark

// Backgrounds
colors.backgroundPrimary    // Main background
colors.backgroundSecondary  // Alternative background

// Components
colors.headerBg             // Header background
colors.formInputBg          // Form input background
colors.neutralBorder        // Border color
```

#### Component Color Combinations
```typescript
componentColors.button.primary      // Primary button
componentColors.button.danger       // Danger button
componentColors.alert.success       // Success alert
componentColors.alert.error         // Error alert
componentColors.input               // Form input
componentColors.card                // Card styling
```

## 📁 File Structure

```
src/app/theme/
├── lightTheme.ts          # Light mode colors
├── darkTheme.ts           # Dark mode colors
├── colors.ts              # Central theme hub
└── ThemeProvider.tsx      # Context & hooks
```

## 🎯 Key Features

✅ **Persistent Storage**: Theme saved in localStorage (key: "theme")
✅ **System Detection**: Auto-detects OS dark/light preference
✅ **Global State**: React Context for easy access
✅ **Type Safe**: Full TypeScript support
✅ **No Breaking Changes**: Fully backward compatible
✅ **Responsive**: Works on all screen sizes
✅ **Accessible**: Proper contrast ratios in both modes

## 📊 Light Mode Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Blue | #1e88e5 |
| Background | White | #ffffff |
| Text | Dark Gray | #212121 |
| Border | Light Gray | #e0e0e0 |

## 🌙 Dark Mode Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Light Blue | #42a5f5 |
| Background | Dark Gray | #121212 |
| Text | White | #ffffff |
| Border | Medium Gray | #424242 |

## 🔧 Integrated Pages

All these pages now use the theme system:
- ✅ Header (with toggle button)
- ✅ Dashboard
- ✅ User Profile
- ✅ Login
- ✅ Signup

## 💡 Pro Tips

1. **Toggle Anywhere**: Use `const { toggleTheme } = useTheme()` in any component
2. **Conditional Styling**: Access `name` property to conditionally render different elements
3. **Custom Colors**: Extend themes by modifying `lightTheme.ts` or `darkTheme.ts`
4. **Component Colors**: Use `componentColors` for consistent component styling

## 🐛 Troubleshooting

**Theme not persisting?**
- Check browser localStorage is enabled
- Clear browser cache and try again

**Colors not updating?**
- Ensure component is wrapped with `<ThemeProvider>`
- Check `useTheme()` is called inside provider scope

**Type errors?**
- Import types: `import type { Theme } from "../theme/colors"`

## 📚 Additional Resources

- See `THEME_SYSTEM.md` for detailed documentation
- Check individual theme files for color definitions
- Review `ThemeProvider.tsx` for implementation details

## 🎉 You're All Set!

The theme system is ready to use. Visit your app and try clicking the theme toggle button in the header!
