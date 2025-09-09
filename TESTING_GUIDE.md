# SwapStay Testing Guide

## 🚀 Services Status
✅ **Backend API:** Running on http://localhost:5001
✅ **MongoDB:** Running on localhost:27017
✅ **Frontend:** Running on iOS Simulator

## 📱 Testing the App

### 1. Authentication Flow Testing
1. **Onboarding:** 
   - Swipe through 3 intro screens or click "Skip"
   
2. **Sign Up (New User):**
   - Click "Sign Up" on auth screen
   - Enter a .edu email (e.g., john.doe@university.edu)
   - Select a university from the dropdown
   - Enter a password (min 6 characters)
   - Submit to create account

3. **Sign In (Existing User):**
   - Use the email/password you just created
   - Token will be stored for persistent login

### 2. Main App Features

#### Home Screen
- **View Listings:** Browse featured and recent listings
- **Pull to Refresh:** Swipe down to refresh listings
- **Filter Chips:** Quick filters for Swap/Rent/Both
- **Create Listing:** Tap the floating "+" button

#### Create Listing (5-Step Wizard)
1. **Listing Type:** Choose SWAP_ONLY, RENT_ONLY, or BOTH
2. **Property Details:** Type, bedrooms, bathrooms, size
3. **Location:** Address and university association
4. **Availability:** Select dates with calendar picker
5. **Pricing:** Set rental price (if applicable)

#### Search Screen
- Search by location, university, or property type
- Apply filters for price range, dates, amenities

#### Messages Screen
- View conversations (UI only - backend not implemented)

#### Profile Screen
- View your profile info
- Manage your listings
- Settings and logout

## 🧪 API Testing with curl

### Health Check
```bash
curl http://localhost:5001/health
```

### Register New User
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "password123",
    "university": "Test University"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "password123"
  }'
```

### Get All Listings
```bash
curl http://localhost:5001/api/v1/listings
```

### Create Listing (requires auth token)
```bash
# First login to get token
TOKEN=$(curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@university.edu", "password": "password123"}' \
  | jq -r '.token')

# Then create listing
curl -X POST http://localhost:5001/api/v1/listings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cozy Studio near Campus",
    "type": "BOTH",
    "property": {
      "type": "studio",
      "bedrooms": 0,
      "bathrooms": 1,
      "squareFeet": 500
    },
    "location": {
      "address": "123 University Ave",
      "city": "College Town",
      "state": "TX",
      "zipCode": "12345",
      "university": "Test University"
    },
    "availability": {
      "startDate": "2025-12-15",
      "endDate": "2026-01-15"
    },
    "pricing": {
      "rentPrice": 800
    }
  }'
```

## 🔍 Monitoring Logs

### Backend Logs
Check the terminal where backend is running for:
- API requests and responses
- Database operations
- Authentication events
- Error messages

### Frontend Logs
Check the Metro bundler terminal for:
- Component renders
- API calls
- Navigation events
- JavaScript errors

### iOS Simulator Console
- Press Cmd+D in simulator to open developer menu
- Select "Debug with Chrome" for full debugging

## 🐛 Common Issues

### iOS Simulator Not Opening
```bash
# Restart Expo
cd frontend && npx expo start -c --ios
```

### Backend Connection Issues
1. Check backend is running: `curl http://localhost:5001/health`
2. Check MongoDB: `brew services list | grep mongodb`
3. Check API URL in frontend/.env: `EXPO_PUBLIC_API_URL=http://localhost:5001`

### Authentication Failures
- Ensure email ends with .edu
- Password must be 6+ characters
- Check backend logs for specific errors

## 📊 Database Inspection

### View MongoDB Data
```bash
# Connect to MongoDB
mongosh

# Use SwapStay database
use swapstay

# View all users
db.users.find().pretty()

# View all listings
db.listings.find().pretty()

# Count documents
db.users.countDocuments()
db.listings.countDocuments()
```

## 🎯 Test Scenarios

### Scenario 1: Complete User Journey
1. Sign up with new .edu email
2. Browse existing listings
3. Create a new listing (all 5 steps)
4. View your listing on home screen
5. Sign out and sign back in
6. Verify persistent session

### Scenario 2: Search and Filter
1. Create multiple listings with different types
2. Test filter chips (Swap Only, Rent Only)
3. Search by university name
4. Pull to refresh

### Scenario 3: Error Handling
1. Try non-.edu email (should fail)
2. Try short password (should fail)
3. Try duplicate email registration
4. Test network disconnection

## 🛑 Stopping Services

### Stop Frontend
Press Ctrl+C in the frontend terminal

### Stop Backend
Press Ctrl+C in the backend terminal

### Stop MongoDB (if needed)
```bash
brew services stop mongodb-community
```

## 📝 Notes
- Email verification is simulated (no actual emails sent)
- Messaging system is UI-only (backend not implemented)
- Native Swift module works only in development builds, not Expo Go
- Logo placeholder is shown (add actual logo to frontend/assets/logo.png)