# SwapStay - College Housing Exchange Platform

## 🎯 Core Philosophy: Maximum Interactivity
**Every feature we build MUST be as interactive as possible.** This means:
- ✨ Real-time updates and feedback
- 🎮 Smooth animations and transitions
- 📱 Native mobile gestures and interactions
- 🔄 Live data synchronization
- 💫 Engaging UI elements that respond to user actions
- ⚡ Instant visual feedback for every tap, swipe, and action

*If we implement something and it's not interactive, we've failed. Interactivity is non-negotiable.*

## 🏠 Project Overview
SwapStay is a highly interactive mobile platform for college students to swap apartments/homes during breaks, internships, or study abroad programs. Students can list their college housing and find swaps with other verified students nationwide.

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

## 🚀 Current State (As of Sep 12, 2025 - 10:45 PM)

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

3. **Listing Creation Wizard** 
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

5. **Working Filter System** ✨ **NEW!**
   - Functional "Swap Only" and "Rent Only" filter chips
   - Smart filtering that includes BOTH listings in specific filters
   - Real-time loading states and filter persistence
   - Filter state management with visual feedback
   - Clear filter functionality

6. **Enhanced Dark Mode** ✨ **IMPROVED!**
   - Significantly improved text contrast and readability
   - Better color scheme with proper slate-based palette
   - Enhanced background, surface, and text colors
   - Smooth theme switching with persistent preferences

7. **Featured Listings Carousel** ✨ **NEW!**
   - Horizontal scrolling featured properties section
   - Sample data populated for testing
   - Resolved empty space issue in home screen layout
   - Enhanced property discoverability

8. **Edit Profile Functionality** ✨ **NEW!**
   - Complete profile editing screen with interactive UI
   - Read-only display of email and university information
   - Editable fields: Full Name, Bio, Year in School, Major
   - **Interactive Year Picker**: Beautiful custom selector with icons for each academic level
   - Profile picture upload with camera/gallery integration
   - Real-time change detection and smart save system
   - Full backend integration with database persistence
   - Verification badges for email status

9. **Wishlist/Saved Listings**
   - Replaced redundant Search tab with interactive Wishlist
   - Save multiple listings for later comparison
   - One-tap save/remove with heart icon animations
   - Dedicated wishlist screen showing all saved properties
   - Save date tracking for each listing
   - Empty state with call-to-action
   - Pull-to-refresh functionality
   - Full backend integration with MongoDB persistence

10. **Enhanced Filter System**
   - Backend support for amenity-based filtering
   - "Furnished" and "Parking" filter buttons fully functional
   - Database populated with test listings containing various amenities
   - Real-time filter application with visual feedback
   - Multiple filter combinations supported

11. **Interactive Listing Detail Screen** ✨ 
   - Swipeable photo gallery with carousel
   - Photo counter and navigation indicators
   - Save to wishlist with animated heart icon
   - Complete property information display
   - Interactive amenities grid with icons
   - House rules with visual indicators
   - Owner profile card (clickable)
   - Availability dates with flexible badge
   - Bottom action bar with Message and Request buttons
   - Full dark mode support

12. **Match/Swap Request System** ✨ **NEW!**
   - **Smart Request Modal**: Interactive UI for swap/rent requests
   - **Property Selection**: Choose from user's listings for swaps
   - **Date Picker Integration**: Native date selection with validation
   - **Price Input**: Proposed pricing for rent requests
   - **Smart Defaults**: Auto-populated messages and prices
   - **Request Type Detection**: Adapts based on listing type (SWAP_ONLY, RENT_ONLY, BOTH)
   - **Real-time Validation**: Instant feedback and error handling
   - **Smooth Animations**: Beautiful modal transitions and interactions

13. **Main App Navigation**
   - Optimized bottom tab navigation (Home, Wishlist ❤️, Messages, Profile)
   - Removed redundant Search tab (search available in Home)
   - Navigation to CreateListing and EditProfile screens
   - Interactive tab icons with focus states

13. **Native iOS Module (Swift)**
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
  - Smart filter options (includes BOTH listings)
  - Search functionality
  - View and favorite tracking
  - Owner verification

**User Profile System:** ✨ **ENHANCED!**
- ✨ **User Management Endpoints:**
  - GET /api/v1/users/me (get current user profile)
  - PUT /api/v1/users/me (update user profile)
  - Flexible authentication middleware for profiles
  - Support for unverified users accessing profiles
- ✨ **Profile Features:**
  - Complete user data access
  - Profile update functionality with selective field updates
  - Proper error handling and validation
  - Database persistence with MongoDB
  - Debug logging for troubleshooting

**Wishlist System:** ✨
- ✨ **Wishlist Endpoints:**
  - GET /api/v1/wishlist (get all saved listings)
  - POST /api/v1/wishlist/:listingId (add to wishlist)
  - DELETE /api/v1/wishlist/:listingId (remove from wishlist)
  - POST /api/v1/wishlist/toggle/:listingId (toggle save status)
  - GET /api/v1/wishlist/check/:listingId (check if saved)
- ✨ **Features:**
  - User-specific saved listings with timestamps
  - Duplicate prevention
  - Full listing details with owner information
  - MongoDB persistence with references

**Match/Swap Request System:** ✨ **NEW!**
- ✨ **SwapRequest Model:**
  - Complete request lifecycle (PENDING, ACCEPTED, DECLINED, CANCELLED, EXPIRED)
  - Support for both SWAP and RENT request types
  - Smart compatibility scoring with detailed factors breakdown
  - Auto-expiry system (7-day lifecycle with cleanup)
  - Integration with messaging system for automatic conversations
- ✨ **Smart Matching Algorithm:**
  - AI-powered compatibility scoring based on 4 factors:
  - 📅 Date overlap analysis (30% weight)
  - 🌍 Location/university matching (20% weight)
  - 🏠 Property type compatibility (25% weight)
  - 🎓 Academic/university matching (25% weight)
  - Match insights generation for UI display
- ✨ **Complete API Endpoints:**
  - POST /api/v1/requests (create swap/rent requests)
  - GET /api/v1/requests (get user's requests with filtering)
  - GET /api/v1/requests/:id (get specific request details)
  - PUT /api/v1/requests/:id/respond (accept/decline requests)
  - PUT /api/v1/requests/:id/cancel (cancel pending requests)
  - GET /api/v1/requests/listing/:id (get requests for specific listing)
  - GET /api/v1/requests/stats (get request statistics)

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

**Latest Updates (Sep 12, 2025 - 10:45 PM):**
- ✅ **MATCH/SWAP REQUEST SYSTEM COMPLETE**
  - Built complete request lifecycle from creation to expiry
  - Smart compatibility scoring algorithm with 4-factor analysis
  - Interactive request modal with property selection and date pickers
  - Backend API with full CRUD operations and statistics
  - Automatic conversation creation for seamless communication
  - Support for both SWAP and RENT request types
  - 7-day auto-expiry system with background cleanup
  - Verified end-to-end request flow from UI to database

**Previous Updates (Sep 12, 2025 - 4:30 PM):**
- ✅ **LISTING DETAIL SCREEN COMPLETE**
  - Built comprehensive interactive listing detail view
  - Swipeable photo gallery with carousel and indicators
  - Wishlist integration with save/unsave functionality
  - Complete property details with amenities grid
  - Owner information card with navigation
  - Bottom action bar for messaging and swap requests
  - Verified end-to-end listing creation and viewing works

**Previous Updates (Sep 12, 2025 - 2:10 PM):**
- ✅ **WISHLIST SYSTEM & TAB OPTIMIZATION**
  - Replaced Search tab with Wishlist
  - Full backend wishlist implementation
  - Optimized 4-tab structure

- ✅ **ENHANCED FILTER SYSTEM**
  - Amenity-based filtering (Furnished, Parking)
  - Database populated with test listings

**Previous Updates (Sep 12, 2025 - 11:02 PM):**
- ✅ **COMPLETE EDIT PROFILE FUNCTIONALITY**
  - Implemented full profile editing screen with beautiful UI
  - Added interactive year-in-school picker with custom icons
  - Read-only fields for email and university with verification badges
  - Fixed backend user update endpoint (was using wrong user ID field)
  - Tested and confirmed database persistence
  - Profile picture upload ready (uses expo-image-picker)
  - Smart save system - only updates changed fields
  - Full dark mode support

**Previous Updates (Sep 12, 2025 - 10:58 PM):**
- ✅ **ENHANCED DARK MODE & WORKING FILTERS**
  - Significantly improved dark mode text contrast and readability
  - Implemented fully functional filter system (Swap Only, Rent Only)
  - Enhanced backend filtering to include BOTH listings intelligently
  - Added missing /api/v1/users/me endpoint for profile management
  - Fixed ProfileScreen JSON parse errors and API communication
  - Populated featured listings carousel (resolved empty space issue)
  - Added proper loading states and filter persistence
  - Enhanced authentication middleware for user profiles

**Previous Updates (Sep 11, 2025 - 2:15 PM):**
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

## 📊 MVP Status Check

### ✅ Completed MVP Features:
1. **User Accounts** ✅
   - .edu email authentication with JWT
   - Profile management with school info
   - Email verification system ready

2. **Listing & Search** ✅ 
   - Create listings with all details
   - Browse with filters (type, amenities)
   - Search by location (in HomeScreen)
   - Wishlist/save functionality
   - Interactive listing detail view

3. **Match/Swap Request System** ✅ **NEW!**
   - Send swap/rental requests from listing details
   - Smart compatibility scoring (4-factor AI algorithm)
   - Request lifecycle management (pending, accepted, declined, expired)
   - Automatic conversation creation
   - Support for both property swaps and rentals

4. **Real-time Messaging** ✅
   - WebSocket-powered live chat
   - Conversation management
   - Typing indicators and read receipts
   - Message notifications

5. **Trust & Safety** ✅
   - .edu email verification
   - User profiles with university info

### 🔴 Missing MVP Features:

1. **My Requests Screen** ❌ (80% complete - backend done)
   - View sent/received requests with status tracking
   - Accept/decline request UI
   - Interactive request cards with match scores

2. **Admin Dashboard** ❌
   - View users and listings
   - Remove inappropriate content
   - Basic usage analytics

## 🚦 Next Steps (TODO)

### 🎯 Core Philosophy Reminder
**Every new feature MUST be highly interactive with:**
- Smooth animations and transitions
- Real-time updates
- Gesture support
- Visual feedback for every action
- Loading states and error handling
- Pull-to-refresh where applicable

### High Priority - MVP Features
1. [x] ~~Wishlist/Saved functionality~~ ✅ DONE!
2. [x] ~~Enhanced filter system~~ ✅ DONE!
3. [x] ~~Listing Detail Screen~~ ✅ DONE!
4. [ ] **Match/Swap Request System** 🔥 NEXT!
   - Backend models for swap requests
   - Send request from listing detail
   - My Requests screen to track status
   - Accept/decline functionality

5. [ ] **Basic Messaging System** 🔥
   - Live chat with WebSocket support
   - Push notifications for new messages
   - Typing indicators and read receipts
   - Interactive message bubbles with gestures

6. [ ] **Simple Admin Dashboard**
   - Web-based admin panel
   - View all users and listings
   - Remove inappropriate content
   - Basic analytics

7. [ ] **Advanced Filter Screen**
   - Interactive sliders for price range
   - Animated checkbox selections
   - Date picker with availability calendar
   - Live preview of filter results count

### Backend Implementation
- [x] ~~Wishlist system~~ ✅ DONE!
- [ ] **WebSocket Chat System**
   - Real-time messaging with Socket.io
   - Message persistence in MongoDB
   - Online/offline status tracking
   - Typing indicators

- [ ] **Swap Matching Algorithm**
   - AI-powered matching based on preferences
   - Notification system for matches
   - Match score visualization

- [ ] **Email Service Integration**
   - SendGrid or AWS SES for notifications
   - Beautiful HTML email templates
   - Verification and welcome emails

### Frontend Improvements
- [ ] **Enhanced Animations**
   - Page transitions with React Native Reanimated
   - Micro-interactions on all buttons
   - Skeleton loading screens
   - Pull-to-refresh with custom animations

- [ ] **Advanced Gestures**
   - Swipe to delete/archive in lists
   - Long press for quick actions
   - Drag to reorder preferences
   - Double tap to favorite

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

**Last Updated:** September 12, 2025, 11:02 PM
**Status:** ✨ Complete Edit Profile functionality with database persistence!
**Achievement:** Fully functional profile editing with interactive UI, smart save system, backend integration, and verified database persistence!