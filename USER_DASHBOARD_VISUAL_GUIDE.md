# User Dashboard - Visual & Usage Guide

## Dashboard Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ 📈 Stock Platform                  Dashboard    👤 John Doe [v] │
└─────────────────────────────────────────────────────────────────┘
                          ↓
                   [Dropdown Menu]
                   - 👤 View Profile
                   - 📊 Dashboard
                   - 🚪 Logout


PROFILE PAGE LAYOUT (when "/profile" is accessed)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         USER PROFILE                    [Logout]│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✓ Success Message (auto-dismisses)                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ACCOUNT INFORMATION                              [Edit] [Cancel]│
│                                                                 │
│  Full Name                                                      │
│  ├─ John Doe                                                    │
│                                                                 │
│  Email                                                          │
│  ├─ john.doe@example.com                                        │
│                                                                 │
│  User ID                                                        │
│  ├─ 1                                                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ACCOUNT BALANCES                                [+ Add Balance]  │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Currency | Available      | Total        | Updated   | Del  ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ USD      | $25,000.00     | $125,000.23  | 11/10     |  🗑️  ││
│ │ EUR      | €5,000.00      | €15,000.00   | 11/09     |  🗑️  ││
│ │ GBP      | £2,000.00      | £8,000.00    | 11/08     |  🗑️  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TRADE HISTORY                                                   │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Date/Time  | Type | Symbol | Qty    | Price    | Total | Del││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ 11/10 10:22| BUY  │ AAPL   │ 50.00  | $180.10  | $9K   | 🗑️ ││
│ │ 11/09 14:03| SELL │ MSFT   │ 5.00   | $369.80  | $1.8K | 🗑️ ││
│ │ 11/08 11:47| BUY  │ NVDA   │ 3.00   │ $892.20  | $2.6K | 🗑️ ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ [← Back to Dashboard]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Usage

### Step 1: Access Profile from Header
```
Location: Any page when logged in (top-right corner)

Visual:
┌──────────────────────────────────────────────────┐
│ 📈 Stock Platform    Dashboard    👤 John Doe [v]│
└──────────────────────────────────────────────────┘
                                      ↑
                              Click profile icon
```

**Result**: Dropdown menu appears with options

---

### Step 2: Open Dropdown Menu
```
Visual:
┌────────────────────────┐
│ John Doe               │
│ User Profile           │
├────────────────────────┤
│ 👤 View Profile        │
├────────────────────────┤
│ 📊 Dashboard           │
├────────────────────────┤
│ 🚪 Logout              │
└────────────────────────┘
     ↑ Click here
     View Profile
```

**Result**: Navigates to `/profile` page

---

### Step 3: View Account Information

```
Display Mode:
┌─────────────────────────────────────────┐
│ Account Information             [Edit]   │
├─────────────────────────────────────────┤
│ Full Name:   John Doe                   │
│ Email:       john@example.com           │
│ User ID:     1                          │
└─────────────────────────────────────────┘
```

**Actions**:
- Click [Edit] to enable editing
- Form becomes editable
- Update name/email
- Click [Save Changes] to persist
- Click [Cancel] to discard changes

---

### Step 4: Edit Profile

```
Edit Mode:
┌─────────────────────────────────────────┐
│ Account Information          [Cancel]    │
├─────────────────────────────────────────┤
│ Full Name:                              │
│ [_________________________]              │
│                                         │
│ Email:                                  │
│ [_________________________]              │
│                                         │
│ [Save Changes]                          │
└─────────────────────────────────────────┘
```

**Validation**:
- Name: Required, max 100 characters
- Email: Required, valid email format, unique
- Errors show above form if validation fails

---

### Step 5: Manage Balances

#### View Balances
```
┌──────────────────────────────────────────────────────┐
│ Account Balances                    [+ Add Balance]   │
├──────────────────────────────────────────────────────┤
│ Currency │ Available      │ Total    │ Updated │ Del  │
├──────────────────────────────────────────────────────┤
│ USD      │ $25,000.00     │ $125K    │ 11/10   │ 🗑️   │
│ EUR      │ €5,000.00      │ €15K     │ 11/09   │ 🗑️   │
└──────────────────────────────────────────────────────┘
```

#### Add New Balance
```
Click [+ Add Balance]:

┌──────────────────────────────────────┐
│ Currency:                            │
│ [USD ▼]                              │
│                                      │
│ Amount:                              │
│ [________________]                   │
│                                      │
│ [Add Balance]  [Cancel]              │
└──────────────────────────────────────┘

Available currencies:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
```

**Result**: New balance added to table, success message shown

#### Delete Balance
```
Click [🗑️] on any balance row:

Confirmation:
"Are you sure?"
[OK]  [Cancel]

Result: Balance removed from table
```

---

### Step 6: View Trade History

```
┌──────────────────────────────────────────────────────────┐
│ Trade History                                            │
├──────────────────────────────────────────────────────────┤
│ Date/Time    │ Type │ Symbol │ Qty    │ Price  │ Total  │
├──────────────────────────────────────────────────────────┤
│ 11/10 10:22  │ BUY  │ AAPL   │ 50.00  │ 180.10 │ $9,005 │
│ 11/09 14:03  │ SELL │ MSFT   │ 5.00   │ 369.80 │ $1,849 │
│ 11/08 11:47  │ BUY  │ NVDA   │ 3.00   │ 892.20 │ $2,676 │
└──────────────────────────────────────────────────────────┘

Legend:
- Type: BUY (green) | SELL (red)
- Qty: Quantity (6 decimal places)
- Price: Price per share
- Total: Total transaction value
```

#### Delete Trade
```
Click [🗑️] on any trade row:

Confirmation:
"Are you sure?"
[OK]  [Cancel]

Result: Trade removed from table
```

---

## Color Scheme & Visual Indicators

### Text Colors
```
✅ Success Text:     #087443 (Green)
❌ Error Text:       #b00020 (Red)
ℹ️ Info Text:        #666    (Gray)
🟦 Primary Action:   #2196f3 (Blue)
```

### Button Styles
```
Primary Button:
┌─────────────────┐
│ Add Balance     │ Background: #4caf50 (Green)
└─────────────────┘ Color: White

Secondary Button:
┌─────────────────┐
│ Edit            │ Background: #e3f2fd (Light Blue)
└─────────────────┘ Color: #2196f3 (Blue)

Danger Button:
┌─────────────────┐
│ Delete          │ Background: #ffebee (Light Red)
└─────────────────┘ Color: #f44336 (Red)

Logout Button:
┌─────────────────┐
│ Logout          │ Background: White
└─────────────────┘ Border: 1px #ddd
```

### Messages
```
Success Message:
┌──────────────────────────────┐
│ ✅ Operation successful!      │ Background: #e8f5e9 (Light Green)
└──────────────────────────────┘ Color: #087443 (Green)

Error Message:
┌──────────────────────────────┐
│ ❌ Something went wrong!      │ Background: #ffebee (Light Red)
└──────────────────────────────┘ Color: #b00020 (Red)
```

---

## Responsive Design

### Desktop View (1200px+)
```
Full-width layout with side-by-side sections
Tables displayed with all columns
Dropdown menu positioned top-right
```

### Tablet View (768px - 1199px)
```
Stacked sections
Tables with scrollbar for overflow
Dropdown menu adjusted positioning
```

### Mobile View (< 768px)
```
Full-width, single column layout
Tables horizontally scrollable
Dropdown menu fills available width
Buttons stack vertically in forms
Profile icon remains accessible
```

---

## Keyboard Navigation

### Keyboard Shortcuts
```
Tab:           Navigate between fields
Enter:         Submit form / Confirm action
Escape:        Close dropdown / Cancel action
Space:         Toggle dropdown / Click button
```

### Form Navigation
```
1. Focus on first input field (Tab)
2. Move to next field (Tab)
3. Move to previous field (Shift+Tab)
4. Submit form (Enter on submit button)
```

---

## Common Tasks & How-Tos

### Task 1: Update Your Name
```
1. Click profile icon (👤) in top-right
2. Select "View Profile"
3. Click [Edit] button in Account Information
4. Clear Full Name field
5. Type new name
6. Click [Save Changes]
7. ✅ Success message appears
```

### Task 2: Add Multiple Currency Accounts
```
1. Go to Account Balances section
2. Click [+ Add Balance]
3. Select "USD" from dropdown
4. Enter amount (e.g., 5000)
5. Click [Add Balance]
6. ✅ USD balance added to table
7. Repeat for other currencies (EUR, GBP, JPY, CAD)
```

### Task 3: Review Your Trading History
```
1. Scroll to Trade History section
2. View all trades in reverse chronological order
3. Examine: Date, Type (BUY/SELL), Symbol, Quantity, Price
4. Most recent trades appear at top
5. Can delete any trade by clicking [🗑️] and confirming
```

### Task 4: Remove Old Balance
```
1. Find balance to delete in Account Balances table
2. Click [🗑️] button on that row
3. Confirm deletion dialog
4. Balance removed from table
5. ✅ Success message appears
```

### Task 5: Logout
```
1. Click profile icon (👤) in top-right
2. Click [🚪 Logout]
3. Redirected to login page
4. ✅ Session ended, token cleared
```

---

## Error Messages & Resolutions

### Error: "unauthorized"
```
Message: "Failed to load user data"
Reason:  Token invalid or expired
Fix:     1. Log out
         2. Log back in
         3. Refresh page
```

### Error: "email_exists"
```
Message: "Email already exists"
Reason:  Email taken by another user
Fix:     Use a different email address
```

### Error: "missing_fields"
```
Message: "Please fill in all required fields"
Reason:  Name or email is empty
Fix:     Fill in all form fields before submitting
```

### Error: "not_found"
```
Message: "Item not found"
Reason:  Trying to delete someone else's data
Fix:     Only delete your own balances/trades
```

### Error: "Network error"
```
Message: "Network error"
Reason:  API unreachable or connection issue
Fix:     1. Check if backend is running
         2. Check internet connection
         3. Verify API_BASE environment variable
```

---

## Performance Tips

### Optimize Loading Time
```
✅ Minimize API calls
✅ Cache user data locally if possible
✅ Load tables incrementally
✅ Use pagination for large datasets (future enhancement)
```

### Optimize UI Responsiveness
```
✅ Use debouncing for form inputs
✅ Show loading indicators
✅ Disable buttons during submission
✅ Cache API responses
```

---

## Accessibility Features

### Screen Reader Support
```
✅ Semantic HTML
✅ ARIA labels on buttons
✅ Form labels linked to inputs
✅ Color not only indicator of status
```

### Keyboard Navigation
```
✅ All interactive elements keyboard accessible
✅ Tab order logical
✅ Focus indicators visible
✅ Keyboard shortcuts where applicable
```

### Visual Accessibility
```
✅ Sufficient color contrast
✅ Large enough touch targets (40x40px minimum)
✅ No reliance on color alone
✅ Clear error messages
```

---

## Summary

The User Dashboard provides a complete, user-friendly interface for managing:
- ✅ Profile Information
- ✅ Account Balances (Multiple Currencies)
- ✅ Trade History
- ✅ Account Settings

With:
- ✅ Full CRUD Operations
- ✅ Responsive Design
- ✅ Secure Authentication
- ✅ Clear Error Handling
- ✅ Professional UI/UX

