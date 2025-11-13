# User Dashboard & Profile Management Feature

## Overview

This document outlines the new User Profile and Dashboard management system for the 272-Project stock trading platform. The feature provides users with a comprehensive interface to manage their account information, balances, and trade history with full CRUD operations.

---

## Features

### 1. User Profile Management
- **View Profile**: Display user information (name, email, user ID)
- **Edit Profile**: Update full name and email address
- **Real-time Validation**: Email uniqueness checking
- **Profile Picture**: Support for future avatar/profile picture implementation

### 2. Account Balances Management
- **View Balances**: List all currency balances associated with the account
- **Add Balance**: Create new account balance in different currencies
- **Delete Balance**: Remove balance entries (with confirmation)
- **Multi-Currency Support**: Support for USD, EUR, GBP, JPY, CAD, and more

### 3. Trade History
- **View Trade History**: Complete list of all trades (buy/sell) with details
- **Trade Information**: Date, type, symbol, quantity, price, and total
- **Delete Trades**: Remove individual trades (with confirmation)
- **Sorting**: Trades displayed in reverse chronological order (newest first)

### 4. Navigation & Access
- **Profile Icon**: Top-right corner of the page (accessible when logged in)
- **Dropdown Menu**: Quick access to profile, dashboard, and logout
- **Responsive Design**: Works on desktop and mobile devices
- **Protected Routes**: Requires authentication to access

---

## Frontend Components

### 1. Header Component (`Header.tsx`)
**Location**: `frontend/web/src/app/components/Header.tsx`

**Features**:
- Displays user's name in profile button
- Profile dropdown menu with quick actions
- Navigation links
- Conditional rendering based on login status
- Hides on login/signup pages

**Key Functions**:
```typescript
- useEffect: Fetches current user info
- handleLogout: Clears token and redirects to login
- setShowDropdown: Toggle dropdown menu visibility
```

**Styling**:
- Dark header background (#1a1a2e)
- Profile button with circular design
- Dropdown menu with hover effects
- Responsive layout

### 2. Profile Page (`profile/page.tsx`)
**Location**: `frontend/web/src/app/profile/page.tsx`

**Sections**:

#### Account Information
- Display: Name, Email, User ID (read-only view)
- Edit Mode: Form to update name and email
- Save/Cancel buttons for edit operations
- Real-time error handling and success messages

#### Account Balances
- Table showing all balances with:
  - Currency code
  - Available balance
  - Total balance
  - Last updated date
  - Delete action button
- Add Balance Form:
  - Currency dropdown (USD, EUR, GBP, JPY, CAD)
  - Amount input field
  - Submit button
- Empty state message

#### Trade History
- Comprehensive trade table with:
  - Date/Time (formatted)
  - Trade type (BUY/SELL) with color coding
  - Stock symbol
  - Quantity (6 decimal places)
  - Price per share
  - Total transaction value
  - Delete action button
- Empty state message
- Reverse chronological sorting

**State Management**:
```typescript
- user: Current user object
- balances: Array of balance records
- trades: Array of trade records
- isEditingProfile: Toggle for profile edit mode
- isAddingBalance: Toggle for balance add form
- error/success: Message display
- loading: Data fetch status
```

---

## Backend API Endpoints

### User Profile Endpoints

#### PUT `/user/profile`
**Purpose**: Update user profile information

**Request**:
```json
{
  "full_name": "string (required)",
  "email": "string (required)"
}
```

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
{
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "full_name": "Updated Name"
  }
}
```

**Error Responses**:
- `400`: Missing fields
- `401`: Unauthorized
- `409`: Email already exists

---

### User Balances Endpoints

#### GET `/user/balances`
**Purpose**: Retrieve all balances for the authenticated user

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "currency": "USD",
    "available_balance": 25000.00,
    "total_balance": 125000.23,
    "updated_at": "2025-11-10T14:30:00"
  }
]
```

**Error Responses**:
- `401`: Unauthorized

---

#### POST `/user/balances`
**Purpose**: Create or update a balance entry

**Request**:
```json
{
  "currency": "USD",
  "available_balance": 25000.00,
  "total_balance": 125000.23
}
```

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "user_id": 1,
  "currency": "USD",
  "available_balance": 25000.00,
  "total_balance": 125000.23,
  "updated_at": "2025-11-10T14:30:00"
}
```

**Error Responses**:
- `400`: Invalid currency or missing data
- `401`: Unauthorized

---

#### DELETE `/user/balances/<balance_id>`
**Purpose**: Delete a balance entry

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
{
  "message": "deleted"
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: Balance not found or unauthorized access

---

### User Trades Endpoints

#### GET `/user/trades`
**Purpose**: Retrieve all trades for the authenticated user

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "company_id": 1,
    "trade_type": "BUY",
    "quantity": 50.000000,
    "price": 180.1000,
    "total_price": 9005.0000,
    "trade_timestamp": "2025-11-10T10:22:00",
    "symbol": "AAPL"
  }
]
```

**Error Responses**:
- `401`: Unauthorized

---

#### DELETE `/user/trades/<trade_id>`
**Purpose**: Delete a trade record

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
{
  "message": "deleted"
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: Trade not found or unauthorized access

---

## User Flow

### 1. Initial Login
```
User at login page
         ↓
Enter credentials
         ↓
Successfully authenticated → Token stored in localStorage
         ↓
Redirect to /dashboard
         ↓
Header displays user name in profile button
```

### 2. Accessing Profile
```
User on dashboard/any page
         ↓
Click profile button (👤) in top-right corner
         ↓
Dropdown menu appears with options:
  - View Profile
  - Dashboard
  - Logout
         ↓
Click "View Profile"
         ↓
Navigate to /profile page
         ↓
Fetch and display user data:
  - Account Information
  - Balances
  - Trade History
```

### 3. Editing Profile
```
On profile page
         ↓
Click "Edit" button on Account Information
         ↓
Form becomes editable
         ↓
Update name/email
         ↓
Click "Save Changes"
         ↓
PUT request to /user/profile
         ↓
Update successful → Success message + page refresh data
```

### 4. Managing Balances
```
On profile page, Balances section
         ↓
Click "+ Add Balance" button
         ↓
Form appears for new balance
         ↓
Select currency and enter amount
         ↓
Click "Add Balance"
         ↓
POST request to /user/balances
         ↓
Balance added to table
         ↓
Can click "Delete" on any balance row
         ↓
Confirm deletion → DELETE request → Remove from table
```

### 5. Viewing Trades
```
On profile page, Trade History section
         ↓
View all trades in table format
         ↓
Can click "Delete" on any trade row
         ↓
Confirm deletion → DELETE request → Remove from table
         ↓
Page auto-refreshes data if needed
```

### 6. Logout
```
Click profile button (👤)
         ↓
Click "Logout" in dropdown
         ↓
Token removed from localStorage
         ↓
Redirect to /login page
```

---

## Security Implementation

### Authentication
- JWT token validation on all user endpoints
- Token stored in browser localStorage
- HTTP-only cookies recommended for production
- Authorization header required: `Bearer <JWT_TOKEN>`

### Data Privacy
- Users can only access their own data
- Database queries verify user ownership
- Foreign key constraints ensure data integrity
- Password hashing with bcrypt

### Input Validation
- Email format validation
- Currency code validation (3 uppercase characters)
- Numeric value validation for balances
- Empty field checking
- SQL injection prevention via parameterized queries

### Error Handling
- Graceful error messages
- Unauthorized access rejection
- 404 responses for missing resources
- Proper HTTP status codes

---

## Database Schema Integration

### Tables Used
1. **users**: User account information
2. **user_balances**: Multi-currency balance management
3. **user_trades**: Trade history records
4. **companies**: Company information for trade symbols

### Relationships
```
users (1) → (many) user_balances
users (1) → (many) user_trades
companies (1) ← (many) user_trades
```

### Key Constraints
- `user_balances`: UNIQUE (user_id, currency) - One balance per currency per user
- `user_trades`: ON DELETE CASCADE for user_id
- Foreign key constraints enforce referential integrity

---

## Frontend File Structure

```
frontend/web/src/app/
├── components/
│   └── Header.tsx                 # Navigation header with profile icon
├── profile/
│   └── page.tsx                   # User profile management page
├── dashboard/
│   └── page.tsx                   # Main dashboard (updated with profile link)
├── layout.tsx                      # Root layout (updated with Header)
├── login/
│   └── page.tsx                   # Login page
├── signup/
│   └── page.tsx                   # Signup page
└── globals.css                     # Global styles
```

---

## Backend File Structure

```
backend/
├── src/
│   └── app.py                      # Main Flask app with new endpoints
├── requirements.txt
├── Dockerfile
└── .env
```

---

## Styling

### Color Scheme
- **Primary**: #2196f3 (Blue)
- **Success**: #4caf50 (Green)
- **Danger**: #f44336 (Red)
- **Background**: #f9f9f9 (Light Gray)
- **Text**: #333 (Dark Gray)
- **Header**: #1a1a2e (Very Dark Blue)

### Responsive Design
- Flexbox and CSS Grid for layouts
- Mobile-first approach
- Maximum width 1200px for content
- Overflow-x auto for tables on mobile

---

## Testing Checklist

### Frontend
- [ ] User can log in and see profile button
- [ ] Clicking profile button shows dropdown menu
- [ ] Can navigate to profile page from dropdown
- [ ] Profile information displays correctly
- [ ] Can edit profile and save changes
- [ ] Can add new balance entry
- [ ] Can delete balance entry (with confirmation)
- [ ] Can view trade history
- [ ] Can delete trade (with confirmation)
- [ ] Error messages display correctly
- [ ] Success messages appear and disappear
- [ ] Logout works and clears token
- [ ] Page is responsive on mobile

### Backend
- [ ] PUT /user/profile updates user data
- [ ] PUT /user/profile rejects unauthorized requests
- [ ] GET /user/balances returns user's balances only
- [ ] POST /user/balances creates new balance
- [ ] POST /user/balances handles duplicate currencies
- [ ] DELETE /user/balances removes balance
- [ ] GET /user/trades returns user's trades only
- [ ] DELETE /user/trades removes trade
- [ ] All endpoints validate authorization
- [ ] All endpoints handle errors gracefully

---

## Future Enhancements

1. **Profile Picture Upload**: Add avatar/profile image support
2. **Account Settings**: Two-factor authentication, password change
3. **Transaction History**: Filter and search trades
4. **Export Data**: Export trades/balances as CSV
5. **Activity Log**: Track account changes and login history
6. **Preferences**: Save user preferences (theme, notifications)
7. **Portfolio Analytics**: Charts and performance metrics
8. **Watchlist Integration**: Link watchlist to profile
9. **API Keys**: Generate API keys for automated trading
10. **Notifications**: Email/SMS notifications for trades

---

## Troubleshooting

### Common Issues

**Issue**: Profile dropdown doesn't appear
- **Solution**: Clear browser cache, check localStorage for token

**Issue**: Can't update profile - email exists error
- **Solution**: Use a different email address

**Issue**: Balances/Trades not loading
- **Solution**: Check API endpoints are implemented, verify token validity

**Issue**: Delete operations fail
- **Solution**: Ensure you have permission (owner of record), check console for errors

---

## Documentation Files

- **SCHEMAS_DOCUMENTATION.md**: Database schema details
- **This file**: User Dashboard feature documentation
- **README.md**: Project overview
- **DOCKER_SETUP.md**: Docker deployment guide

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-12 | 1.0 | Initial user dashboard implementation |

