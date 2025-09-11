# SwapStay Testing Guide

## 🚀 Services Status
✅ **Backend API:** Running on http://localhost:5001
✅ **MongoDB:** Running on localhost:27017
✅ **Frontend:** Running with Expo
✅ **Metro Bundler:** Active on http://localhost:8081
✅ **Local IP:** 192.168.1.222:8081 (for phone testing)

## 📱 Testing on Your Phone

### Quick Setup:
1. **Install Expo Go** on your iPhone from App Store
2. **Ensure WiFi**: Phone and laptop on same network
3. **Open Expo Go** and tap "Enter URL manually"
4. **Enter**: `exp://192.168.1.222:8081`
5. **Press Connect** - SwapStay will load!

### Alternative - VS Code Port Forwarding:
1. In VS Code, open Ports panel (View → Terminal → Ports)
2. Forward port 8081
3. Use the forwarded URL in Expo Go

## 📱 Testing the App

### 1. Authentication Flow Testing
1. **Onboarding:** 
   - ✨ **NEW**: SwapStay logo displays at top
   - Swipe through 3 intro screens or click "Skip"
   
2. **Sign Up (New User):**
   - ✨ **NEW**: Logo displays in auth header
   - Click "Sign Up" on auth screen
   - Enter a .edu email (e.g., john.doe@university.edu)
   - Select a university from dropdown (100+ universities including Texas Tech!)
   - Enter full name
   - Enter a password (min 8 characters)
   - Confirm password
   - Submit to create account

3. **Sign In (Existing User):**
   - Use the email/password you just created
   - Token will be stored for persistent login

### 2. Main App Features

#### Home Screen
- ✨ **NEW**: SwapStay logo in header
- **View Listings:** Browse featured and recent listings
- ✨ **NEW**: Tap any listing to open detailed view
- **Pull to Refresh:** Swipe down to refresh listings
- **Filter Chips:** Quick filters for Swap/Rent/Both
- **Create Listing:** Tap the floating "+" button

#### 🎯 Listing Detail Screen (COMPLETELY NEW!)
- **Image Gallery:** Swipe through property photos
- **Property Info:** Type, bedrooms, bathrooms, size with icons
- **Location:** Full address with university proximity
- **Availability:** Date range with flexible indicator
- **Pricing:** Monthly rent, deposit, utilities status
- **Amenities Grid:** WiFi, parking, laundry, A/C, etc.
- **Owner Section:** Profile with verified badge
- **Actions:** Contact owner button, favorite, share, report

#### Create Listing (NOW 6-STEP WIZARD!)
1. **Basic Info:** Title, description, listing type (SWAP/RENT/BOTH)
2. **Property Details:** Type with icons, bedrooms, bathrooms, size
3. **Location:** Full address and university association
4. **Availability & Pricing:** Dates, rent, deposit, utilities
5. **Amenities:** Toggle switches for 10+ amenities
6. ✨ **NEW - Photos:** Upload up to 10 photos from gallery or camera

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
- ✅ **Logo is now integrated** throughout the app (SwapStay purple gradient logo)
- ✅ **Listing Detail Screen** is fully functional with navigation
- ✅ **Photo upload** works in Create Listing (Step 6)
- Email verification is simulated (no actual emails sent)
- Messaging system is UI-only (backend not implemented)
- Native Swift module works only in development builds, not Expo Go

## 🎉 What's New in This Version
1. **SwapStay Logo** - Custom purple gradient logo on all screens
2. **ListingDetailScreen** - Complete property detail view with gallery
3. **Enhanced CreateListing** - Now 6 steps with photo upload
4. **Image Picker** - Gallery and camera support for listing photos
5. **Navigation Fixed** - All listing cards now navigate to detail view