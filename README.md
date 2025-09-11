# SwapStay - College Housing Exchange Platform

## 🏠 Project Overview
SwapStay is a mobile platform for college students to swap apartments/homes during breaks, internships, or study abroad programs. Students can list their college housing and find swaps with other verified students nationwide.

## 🏗️ Architecture: Monorepo Structure

```
swapstay/
├── frontend/              # React Native + Expo mobile app
│   ├── src/
│   │   └── screens/      # App screens (Onboarding, Auth, Home, Search, etc.)
│   ├── modules/          # Native Swift/Kotlin modules
│   ├── assets/           # Images, fonts, icons
│   └── ios/              # iOS-specific code
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── server.ts     # Express server entry point
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Database models
│   │   └── middleware/   # Auth, validation, etc.
│   └── package.json
├── shared/               # Shared code between frontend/backend
│   ├── types/           # TypeScript interfaces
│   └── constants/       # Shared constants
└── README.md            # You are here!
```

## 🚀 Current State (As of Sep 9, 2025 - 8:00 PM)

### ✅ Completed Features

#### Frontend (Mobile App)
1. **Enhanced Onboarding Flow**
   - 3 beautifully animated introduction screens with gradient themes
   - Skip functionality and interactive navigation dots

2. **Complete Authentication System** ✨
   - .EDU email validation with real-time feedback
   - University picker with 100+ universities (including Texas Tech!)
   - Full integration with backend JWT authentication
   - Token management with AsyncStorage
   - Loading states and error handling

3. **Listing Creation Wizard** ✨ **NEW!**
   - 5-step multi-screen form with progress indicator
   - Support for SWAP_ONLY, RENT_ONLY, or BOTH listing types
   - Property details with 6 property types
   - Location input with university association
   - Date picker for availability
   - Flexible pricing options
   - Amenities selection
   - Form validation at each step

4. **Dynamic Home Screen** ✨ **NEW!**
   - Real-time listing display from backend
   - Featured listings carousel
   - Recent listings with detailed cards showing:
     - Property type icons
     - Color-coded listing type badges
     - Bedrooms/bathrooms/price
     - Availability dates
     - Owner information
     - View and favorite counts
   - Pull-to-refresh functionality
   - Quick filter chips
   - Floating Action Button for listing creation
   - Empty state with call-to-action

5. **Main App Navigation**
   - Bottom tab navigation (Home, Search, Messages, Profile)
   - Navigation to CreateListing screen

6. **Native iOS Module (Swift)**
   - Student email verification
   - Haptic feedback
   - Device info retrieval
   - Date formatting utilities

#### Backend (API - Complete Authentication & Listings System)

**Authentication System:**
- ✨ MongoDB database with Mongoose ODM
- ✨ Complete user authentication (register, login, JWT)
- ✨ .edu email validation and verification system
- ✨ Secure password hashing with bcrypt
- ✨ Protected routes with JWT middleware

**Listing System:** ✨ **NEW!**
- ✨ **Comprehensive Listing Model:**
  - Flexible listing types: BOTH, SWAP_ONLY, RENT_ONLY
  - Full property details (type, beds, baths, size)
  - Location with university association
  - Availability dates with flexibility options
  - Pricing for rentals with auto-calculated daily rates
  - Swap preferences for matching
  - Rich amenities tracking
  - House rules management
- ✨ **Complete CRUD Operations:**
  - Create listings (auth required)
  - Browse all listings (public)
  - Get single listing with view tracking
  - Update/Delete (owner only)
  - Featured listings support
  - University-specific listings
- ✨ **Advanced Features:**
  - Pagination support
  - Multiple filter options
  - Search functionality
  - View and favorite tracking
  - Owner verification

#### Shared Resources
- TypeScript types for User, Listing, Swap, Message
- Constants for API URLs, status codes, messages
- Shared between frontend and backend

### 🔧 Tech Stack

**Frontend:**
- React Native 0.79.6
- Expo SDK 53
- TypeScript 5.8.3
- React Navigation 7.x
- Expo Linear Gradient (for beautiful UI gradients)
- Swift for iOS native modules

**Backend:**
- Node.js
- Express 4.x
- TypeScript 5.3
- MongoDB with Mongoose ODM ✅
- JWT authentication (jsonwebtoken) ✅
- bcryptjs for password hashing ✅
- dotenv for environment configuration ✅

**Development:**
- Monorepo structure
- Shared TypeScript types
- Hot reload for both frontend/backend

## 📱 Running the Project

### Frontend (Mobile App)
```bash
cd frontend
npm install
npx expo start           # For Expo Go app

# For testing on physical device:
# 1. Update frontend/.env with your computer's IP:
#    EXPO_PUBLIC_API_URL=http://YOUR_IP:5001/api/v1
# 2. Connect via Expo Go: exp://YOUR_IP:8081
```

### Backend (API)
```bash
# Make sure MongoDB is running first
mongod  # Or: brew services start mongodb-community

cd backend
npm install
npm run dev              # Starts on http://localhost:5001
```

### Test Account
```
Email: test@stanford.edu
Password: password123
```

## 🎨 UI/UX Flow

1. **New User Journey:**
   - Onboarding (3 screens) → Sign Up → Main App

2. **Returning User:**
   - Sign In → Main App

3. **Main App Features:**
   - Browse listings (Home)
   - Search with filters
   - Message other students
   - Manage profile

## 🔄 Last Working Session Context

**Latest Updates (Sep 11, 2025 - 2:15 PM):**
- ✅ **BUG FIXES & STABILITY IMPROVEMENTS**
  - Fixed ListingDetail crash (added null checks for swapPreferences)
  - Fixed Filter button navigation error (added placeholder)
  - Fixed network connectivity for phone testing (using IP address)
  - Created test account: test@stanford.edu / password123
  - Updated API URL for mobile device testing

**Previous Updates (Sep 11, 2025 - 1:05 PM):**
- ✅ **LOGO INTEGRATION COMPLETE!**
  - Added custom SwapStay logo with purple gradient and swap symbol
  - Logo integrated into Onboarding, Authentication, and Home screens
  - Professional branding throughout the app

**Session 4 (Sep 9, 2025 - 8:00 PM):**
- ✅ **BUG FIXES & IMPROVEMENTS**
  - Fixed navigation structure with Stack Navigator for modals
  - Fixed "Create Listing" navigation after successful submission
  - Made "Distance to Campus" field optional
  - Disabled navigation to unimplemented screens (ListingDetail, AllListings)
  - Added request logging middleware to backend for better debugging
  - Fixed authentication controller to handle missing universityDomain
  - Temporarily disabled email verification for testing

**Session 3 (Sep 9, 2025 - 7:10 PM):**
- ✅ **COMPLETE LISTING SYSTEM IMPLEMENTED!**
  - Comprehensive listing model supporting swaps AND rentals
  - Full CRUD operations with authentication
  - Multi-step listing creation wizard in frontend
  - Dynamic home screen displaying real listings
  - Support for Texas Tech's use case (rent during breaks)
- ✅ **FRONTEND ENHANCEMENTS**
  - Create listing screen with 5-step wizard
  - Home screen with featured and recent listings
  - Pull-to-refresh and loading states
  - University list expanded to 100+ schools
- ✅ **BACKEND EXPANSION**
  - Listing model with flexible types (BOTH/SWAP_ONLY/RENT_ONLY)
  - Complete listing controller and routes
  - View tracking and favorites system
  - Advanced search and filter capabilities

**Session 2 (Sep 9, 2025 - 5:54 PM):**
- Backend authentication fully implemented
- MongoDB integration complete
- JWT tokens and password hashing
- Frontend-backend connection established
- API service layer with AsyncStorage

**Session 1 (Sep 9, 2025 - 4:30 PM):**
- Enhanced onboarding screens
- .EDU-only authentication UI
- University selection system

**Known Issues:**
- Email verification is disabled for testing (needs email service integration)
- Filter screen not yet implemented (shows placeholder alert)

## 🚦 Next Steps (TODO)

### High Priority
1. [x] ~~Connect frontend auth to backend API~~ ✅ DONE!
2. [x] ~~Implement JWT authentication~~ ✅ DONE!
3. [x] ~~Set up MongoDB database~~ ✅ DONE!
4. [x] ~~Create user registration/login endpoints~~ ✅ DONE!
5. [ ] Implement email sending service (SendGrid/AWS SES)
6. [ ] Create user profile management endpoints
7. [ ] Build listing CRUD operations

### Backend Implementation
- [x] ~~User authentication system~~ ✅ DONE!
- [ ] Listing CRUD operations
- [ ] Swap matching algorithm
- [ ] Messaging system
- [x] ~~Email verification for .edu addresses~~ ✅ DONE (needs email service)

### Frontend Improvements
- [x] ~~Add actual logo image~~ ✅ DONE!
- [x] ~~Connect to backend API~~ ✅ DONE!
- [x] ~~Implement real authentication flow~~ ✅ DONE!
- [ ] Add listing creation screen
- [ ] Implement chat functionality
- [ ] Add user profile screen with edit functionality

### DevOps
- [ ] Set up Docker containers
- [ ] Configure CI/CD pipeline
- [ ] Add testing (Jest)
- [ ] Environment configuration

## 🐛 Troubleshooting

### "Native module not available in Expo Go"
- This is expected. Native Swift modules require EAS Build
- App has fallbacks for Expo Go testing


### Metro bundler issues
```bash
cd frontend
npx expo start -c    # Clear cache and restart
```

## 📝 Important Notes

- **Monorepo Benefits:** Shared types, single deployment, easier management
- **Current Auth:** UI only - forms validate but don't save data
- **Swift Module:** Works only with EAS Build, not in Expo Go
- **API Status:** Basic Express server running, no database yet

## 🔑 Key Commands

```bash
# Frontend
cd frontend && npx expo start --ios    # iOS Simulator
cd frontend && npx expo start          # Expo Go

# Backend  
cd backend && npm run dev              # Start API server

# Type checking
cd frontend && npx tsc --noEmit        # Check frontend types
cd backend && npx tsc --noEmit         # Check backend types
```

## 👨‍💻 Developer Notes

This is a monorepo setup optimized for:
- Single developer or small team
- Shared TypeScript types
- Rapid prototyping
- Easy deployment

The architecture allows for:
- Independent frontend/backend development
- Shared business logic
- Type safety across the stack
- Future microservices if needed

---

**Last Updated:** September 11, 2025, 2:15 PM
**Status:** 🚀 Stable marketplace platform ready for testing!
**Achievement:** Complete housing exchange marketplace with bug fixes, mobile testing support, and professional branding!