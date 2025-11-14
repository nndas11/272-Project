# Color System Quick Reference

## 🎯 One-Page Guide

### Import
```tsx
import { COLORS, COMPONENT_COLORS } from "../theme/colors";
```

---

## 🎨 Main Colors

| Usage | Variable | Value | Use Case |
|-------|----------|-------|----------|
| Primary Action | `COLORS.primary` | `#1e88e5` | Buttons, links |
| Success/Add | `COLORS.secondary` | `#43a047` | Positive actions |
| Delete/Error | `COLORS.danger` | `#e53935` | Destructive actions |
| Warning | `COLORS.warning` | `#fb8c00` | Warnings |
| Primary Text | `COLORS.textPrimary` | `#212121` | Main text |
| Secondary Text | `COLORS.textSecondary` | `#666666` | Labels |
| White Background | `COLORS.backgroundPrimary` | `#ffffff` | Main bg |
| Light Background | `COLORS.backgroundSecondary` | `#f9f9f9` | Cards |

---

## 🔤 Text Usage

```tsx
// Main heading or important text
<h1 style={{ color: COLORS.textPrimary }}>Title</h1>

// Secondary information
<p style={{ color: COLORS.textSecondary }}>Description</p>

// Disabled or placeholder text
<span style={{ color: COLORS.textTertiary }}>Placeholder</span>

// White text on dark background
<span style={{ color: COLORS.textInverse }}>White text</span>
```

---

## 🔘 Button Patterns

### Primary Button
```tsx
<button style={{
  background: COLORS.primary,
  color: COLORS.textInverse,
  border: `1px solid ${COLORS.primary}`,
  padding: "8px 16px",
  borderRadius: 6,
  cursor: "pointer"
}}>
  Primary Action
</button>
```

### Secondary Button (Green)
```tsx
<button style={{
  background: COLORS.secondary,
  color: COLORS.textInverse,
  border: `1px solid ${COLORS.secondary}`
}}>
  Add / Save
</button>
```

### Danger Button (Red)
```tsx
<button style={{
  background: COLORS.danger,
  color: COLORS.textInverse,
  border: `1px solid ${COLORS.danger}`
}}>
  Delete
</button>
```

### Tertiary Button (Gray)
```tsx
<button style={{
  background: COLORS.neutralLight,
  color: COLORS.textPrimary,
  border: `1px solid ${COLORS.neutralBorder}`
}}>
  Cancel
</button>
```

---

## 🎪 Alert/Message Boxes

### Success Message
```tsx
<div style={{
  background: COMPONENT_COLORS.alert.success.bg,
  color: COMPONENT_COLORS.alert.success.text,
  border: `1px solid ${COMPONENT_COLORS.alert.success.border}`,
  padding: 12,
  borderRadius: 6
}}>
  ✅ Success message
</div>
```

### Error Message
```tsx
<div style={{
  background: COMPONENT_COLORS.alert.error.bg,
  color: COMPONENT_COLORS.alert.error.text,
  border: `1px solid ${COMPONENT_COLORS.alert.error.border}`,
  padding: 12,
  borderRadius: 6
}}>
  ❌ Error message
</div>
```

### Warning Message
```tsx
<div style={{
  background: COMPONENT_COLORS.alert.warning.bg,
  color: COMPONENT_COLORS.alert.warning.text,
  border: `1px solid ${COMPONENT_COLORS.alert.warning.border}`,
  padding: 12,
  borderRadius: 6
}}>
  ⚠️ Warning message
</div>
```

---

## 📊 Table Styling

### Header Row
```tsx
<thead>
  <tr style={{ background: COLORS.tableHeaderBg }}>
    <th style={{ 
      color: COLORS.tableHeaderText,
      padding: 12,
      fontWeight: 600
    }}>
      Column Name
    </th>
  </tr>
</thead>
```

### Body Rows (with alternating colors)
```tsx
{data.map((item, index) => (
  <tr
    key={item.id}
    style={{
      background: index % 2 === 0 
        ? COLORS.backgroundPrimary 
        : COLORS.tableRowAlt,
      borderBottom: `1px solid ${COLORS.tableBorder}`
    }}
  >
    <td style={{ color: COLORS.textPrimary, padding: 12 }}>
      {item.name}
    </td>
  </tr>
))}
```

---

## 📝 Form Styling

### Input Field
```tsx
<input
  type="text"
  style={{
    background: COLORS.formInputBg,
    color: COLORS.formInputText,
    border: `1px solid ${COLORS.formInputBorder}`,
    padding: 10,
    borderRadius: 6,
    fontFamily: "inherit"
  }}
/>
```

### Label
```tsx
<label style={{
  color: COLORS.textPrimary,
  fontWeight: 500,
  marginBottom: 4,
  display: "block"
}}>
  Label Text
</label>
```

---

## 🔄 Hover Effects

### Color Change on Hover
```tsx
<button
  onMouseEnter={(e) => 
    e.currentTarget.style.background = COLORS.primaryDark
  }
  onMouseLeave={(e) => 
    e.currentTarget.style.background = COLORS.primary
  }
  style={{ background: COLORS.primary }}
>
  Hover Me
</button>
```

### Background Change on Hover
```tsx
<div
  onMouseEnter={(e) => e.currentTarget.style.background = COLORS.hoverBg}
  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
  style={{ cursor: "pointer", padding: 12 }}
>
  Hover Area
</div>
```

---

## 🏷️ Trade-Specific Colors

### BUY Trade (Green)
```tsx
<td style={{ 
  color: COLORS.tradeBuy,  // Dark green #087443
  fontWeight: 600 
}}>
  BUY
</td>
```

### SELL Trade (Red)
```tsx
<td style={{ 
  color: COLORS.tradeSell,  // Dark red #b00020
  fontWeight: 600 
}}>
  SELL
</td>
```

---

## 👤 Header/Navigation Colors

```tsx
<header style={{
  background: COLORS.headerBg,           // #1a1a2e
  color: COLORS.headerText,              // #ffffff
  borderBottom: `1px solid ${COLORS.headerBorder}`
}}>
  {/* Header content */}
</header>
```

### Profile Button
```tsx
<button style={{
  background: COLORS.headerProfileBg,    // #2d3561
  border: `1px solid ${COLORS.headerProfileBorder}`, // #4a5587
  color: COLORS.headerText
}}>
  👤
</button>
```

---

## 🎨 Light Variants (for backgrounds)

| Color | Light Variant | Use Case |
|-------|---------------|----------|
| Primary Blue | `COLORS.primaryLight` | Light blue bg for secondary buttons |
| Secondary Green | `COLORS.secondaryLight` | Light green bg for add buttons |
| Danger Red | `COLORS.dangerLight` | Light red bg for delete buttons |
| Warning Orange | `COLORS.warningLight` | Light orange bg for warnings |

### Example: Light Button Background
```tsx
<button style={{
  background: COLORS.primaryLight,       // #e3f2fd (light blue)
  color: COLORS.primary,                 // #1e88e5 (dark blue)
  border: `1px solid ${COLORS.primary}`
}}>
  Secondary Button
</button>
```

---

## 🔗 Borders & Shadows

```tsx
// Standard border
borderBottom: `1px solid ${COLORS.neutralBorder}`

// Darker border
border: `2px solid ${COLORS.neutralBorderDark}`

// Standard shadow
boxShadow: `0 2px 8px ${COLORS.shadow}`

// Dark shadow (for depth)
boxShadow: `0 4px 12px ${COLORS.shadowDark}`

// Light shadow
boxShadow: `0 1px 2px ${COLORS.shadowLight}`
```

---

## 📍 Card/Panel Styling

```tsx
<div style={{
  background: COLORS.backgroundSecondary,    // Light gray
  border: `1px solid ${COLORS.neutralBorder}`,
  borderRadius: 8,
  padding: 16,
  boxShadow: `0 2px 8px ${COLORS.shadow}`
}}>
  Card Content
</div>
```

---

## 🌐 Global Updates

To change all colors application-wide:

1. Edit: `src/app/theme/colors.ts`
2. Modify color values (e.g., `#1e88e5` → your color)
3. Save file
4. All components automatically update ✨

---

## 📚 Full Guide

For detailed information, see:
- **`src/app/theme/colors.ts`** - All color definitions
- **`COLOR_GUIDE.md`** - Comprehensive documentation
- **`profile/page.tsx`** - Real usage examples
- **`components/Header.tsx`** - Real usage examples

---

## 🎓 Color Categories in Order

1. **Primary Colors** (blue, green, red, orange)
2. **Neutral/Gray** (borders, backgrounds)
3. **Text** (4 levels: primary, secondary, tertiary, inverse)
4. **Backgrounds** (3 levels: primary, secondary, tertiary)
5. **Component-specific** (header, table, form, alerts)
6. **Trade colors** (buy, sell)
7. **Shadows & Borders**

---

## ✅ Checklist for New Developers

- [ ] Understand the color categories
- [ ] Know where to find `COLORS` import
- [ ] Can create a button with color
- [ ] Can create an alert message
- [ ] Know how to change global colors
- [ ] Read `COLOR_GUIDE.md` for reference
- [ ] Check `profile/page.tsx` for examples

---

**Last Updated:** November 12, 2025  
**Status:** Production Ready ✅

