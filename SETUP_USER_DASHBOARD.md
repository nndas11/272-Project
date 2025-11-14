# User Dashboard - Quick Setup Guide

## What's New

A complete user profile management system has been added to the 272-Project stock trading platform with the following features:

### ✨ Features Implemented

1. **Profile Icon Navigation** (Top-Right Corner)
   - Circular profile button with user avatar
   - Dropdown menu for quick access
   - Shows user name on hover

2. **User Profile Page** (`/profile` route)
   - View account information (name, email, user ID)
   - Edit profile with real-time validation
   - Manage account balances (multi-currency support)
   - Complete trade history with details
   - Full CRUD operations for balances and trades

3. **Backend API Endpoints** (6 new endpoints)
   - `PUT /user/profile` - Update profile
   - `GET /user/balances` - List balances
   - `POST /user/balances` - Add balance
   - `DELETE /user/balances/<id>` - Remove balance
   - `GET /user/trades` - List trades
   - `DELETE /user/trades/<id>` - Remove trade

---

## File Changes

### New Files Created

#### Frontend
- `frontend/web/src/app/profile/page.tsx` - User profile management page
- `frontend/web/src/app/components/Header.tsx` - Navigation header with profile icon

#### Documentation
- `USER_DASHBOARD_DOCUMENTATION.md` - Complete feature documentation
- `SCHEMAS_DOCUMENTATION.md` - Database schemas reference (already created)

### Modified Files

#### Frontend
- `frontend/web/src/app/layout.tsx` - Added Header component to root layout
- `frontend/web/src/app/dashboard/page.tsx` - Added profile link button

#### Backend
- `backend/src/app.py` - Added 6 new API endpoints for user management

---

## How to Access

### 1. **From Dashboard**
   - Click the circular profile button (👤) in the top-right corner
   - Select "View Profile" from dropdown menu

### 2. **Direct URL**
   - Navigate to `http://localhost:3000/profile`
   - Must be logged in

### 3. **From Dashboard Page**
   - Click the blue "👤 Profile" button next to Logout button

---

## Features Breakdown

### Account Information Section
```
┌─────────────────────────────┐
│ Account Information   [Edit]│
├─────────────────────────────┤
│ Full Name: John Doe         │
│ Email: john@example.com     │
│ User ID: 1                  │
└─────────────────────────────┘
```

**Actions**:
- Click "Edit" to modify name and email
- Click "Save Changes" to update (with validation)
- Changes are persistent in database

### Account Balances Section
```
┌──────────────────────────────────────┐
│ Account Balances      [+ Add Balance]│
├──────────────────────────────────────┤
│ Currency | Available | Total | Date  │
├──────────────────────────────────────┤
│ USD      | $25,000   | $125K | 11/10 │
│ EUR      | €5,000    | €15K  | 11/09 │
└──────────────────────────────────────┘
```

**Actions**:
- View all currency balances
- Click "+ Add Balance" to create new entry
- Select currency, enter amount, click "Add Balance"
- Click "Delete" to remove (requires confirmation)

**Supported Currencies**:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)

### Trade History Section
```
┌──────────────────────────────────────┐
│ Trade History                        │
├──────────────────────────────────────┤
│ Date | Type | Symbol | Qty | Price  │
├──────────────────────────────────────┤
│ 11/10│ BUY  │ AAPL   │ 50  │ $180.10│
│ 11/09│ SELL │ MSFT   │ 5   │ $369.80│
└──────────────────────────────────────┘
```

**Actions**:
- View all past trades
- See trade details: date, type (BUY/SELL), symbol, quantity, price
- Click "Delete" to remove trade (requires confirmation)
- Trades are sorted newest first

---

## API Endpoints Reference

### User Profile
```bash
# Get current user info (used in Header)
GET /auth/me
Authorization: Bearer <TOKEN>

# Update profile
PUT /user/profile
Authorization: Bearer <TOKEN>
Body: {
  "full_name": "New Name",
  "email": "newemail@example.com"
}
```

### Balances Management
```bash
# Get all balances
GET /user/balances
Authorization: Bearer <TOKEN>

# Add/Create balance
POST /user/balances
Authorization: Bearer <TOKEN>
Body: {
  "currency": "USD",
  "available_balance": 25000.00,
  "total_balance": 125000.23
}

# Delete balance
DELETE /user/balances/1
Authorization: Bearer <TOKEN>
```

### Trades Management
```bash
# Get all trades
GET /user/trades
Authorization: Bearer <TOKEN>

# Delete trade
DELETE /user/trades/1
Authorization: Bearer <TOKEN>
```

---

## Testing the Feature

### Prerequisites
1. Docker containers running (`docker compose up -d`)
2. Backend and PostgreSQL services active
3. Frontend dev server running

### Test Steps

#### 1. Login/Signup
- Go to `http://localhost:3000/signup`
- Create a test account
- Login with credentials

#### 2. Test Profile Icon
- Navigate to dashboard
- Look for profile button (👤) in top-right corner
- Click to open dropdown menu
- Verify menu shows: View Profile, Dashboard, Logout

#### 3. Test Profile Page Access
- From dropdown, click "View Profile"
- Should navigate to `/profile` page
- Wait for data to load

#### 4. Test Edit Profile
- On profile page, click "Edit" button
- Change name and/or email
- Click "Save Changes"
- Success message should appear
- Data should persist (refresh page to verify)

#### 5. Test Add Balance
- Scroll to "Account Balances" section
- Click "+ Add Balance" button
- Form should appear
- Select currency (e.g., USD)
- Enter amount (e.g., 5000)
- Click "Add Balance"
- Balance should appear in table
- Success message should display

#### 6. Test Delete Balance
- In balances table, click "Delete" on a row
- Confirm deletion
- Balance should be removed from table
- Success message should display

#### 7. Test Trade History
- Scroll to "Trade History" section
- If trades exist, they should display in table
- Can click "Delete" on any trade (requires confirmation)
- Should show success message when deleted

#### 8. Test Logout
- Click profile button (👤)
- Click "Logout"
- Should redirect to login page
- Token should be cleared from localStorage

#### 9. Test Protected Route
- Try accessing `/profile` without login
- Should redirect to `/login` page

#### 10. Test Responsive Design
- View profile page on mobile (use browser dev tools)
- Tables should be scrollable
- Layout should stack properly
- Buttons should be accessible

---

## Troubleshooting

### Problem: Profile button doesn't appear in header
**Solution**:
- Hard refresh browser (Ctrl+Shift+R)
- Check localStorage for token
- Ensure you're logged in
- Check browser console for errors

### Problem: Can't update profile - email exists error
**Solution**:
- Choose a different email address
- Email must be unique in the system
- If updating to same email, that's allowed

### Problem: Balances/Trades not loading
**Solution**:
- Check backend is running (`docker compose ps`)
- Check browser console for API errors
- Verify token is valid
- Check network tab to see request/response

### Problem: Delete operations fail
**Solution**:
- Ensure you're deleting your own data (not someone else's)
- Confirm the deletion dialog that appears
- Check backend logs for errors

### Problem: API returns 401 Unauthorized
**Solution**:
- Token may be expired (login again)
- Token may be invalid (check localStorage)
- Authorization header may be missing
- Try logging out and logging back in

### Problem: Page shows "Loading..." forever
**Solution**:
- Check if backend API is accessible
- Verify API_BASE env variable is correct
- Check browser console for fetch errors
- Restart Docker containers

---

## Environment Setup

Ensure `.env` file in backend is configured:

```
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=stocks_db
FINNHUB_TOKEN=your_token_here
SECRET_KEY=your-secret-key
SYMBOLS=AAPL,MSFT,GOOGL,TSLA
```

Frontend `.env.local` (if needed):

```
NEXT_PUBLIC_API_BASE=http://localhost:5050
```

---

## Database Requirements

The following tables must exist (created by `db_create_script.txt`):

- `users` - User accounts
- `user_balances` - Multi-currency balances
- `user_trades` - Trade history
- `companies` - Company information

All required tables are automatically created when PostgreSQL container starts.

---

## Security Notes

✅ **Implemented**:
- JWT authentication on all user endpoints
- Password hashing with bcrypt
- Email uniqueness validation
- User data isolation (users can only access their own data)
- CSRF protection via token validation
- SQL injection prevention via parameterized queries

⚠️ **Recommendations for Production**:
- Use HTTPS instead of HTTP
- Store JWT in HTTP-only cookies instead of localStorage
- Add rate limiting on API endpoints
- Implement email verification
- Add two-factor authentication
- Use environment variables for sensitive data
- Enable CORS only for trusted origins

---

## Next Steps

1. **Deploy**: Push changes to GitHub/production
2. **Test**: Run through testing checklist
3. **Monitor**: Check logs for any issues
4. **Feedback**: Gather user feedback
5. **Enhance**: Consider features from "Future Enhancements" section

---

## Support & Documentation

- **Full Feature Docs**: See `USER_DASHBOARD_DOCUMENTATION.md`
- **Schema Docs**: See `SCHEMAS_DOCUMENTATION.md`
- **Setup Guide**: See `DOCKER_SETUP.md`
- **Project README**: See `README.md`

---

## Quick Commands

```bash
# Start development
cd frontend/web
npm run dev

# Backend in Docker
docker compose up -d

# View logs
docker compose logs -f backend

# Restart after code changes
docker compose restart backend

# Access database
docker compose exec postgres psql -U postgres -d stocks_db
```

---

**Last Updated**: November 12, 2025
**Status**: ✅ Complete and Ready to Use

