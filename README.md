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

## 🚀 Current State (As of Sep 9, 2025 - 4:30 PM)

### ✅ Completed Features

#### Frontend (Mobile App)
1. **Enhanced Onboarding Flow**
   - 3 beautifully animated introduction screens
   - Gradient backgrounds that change per screen
   - Smooth fade/slide/scale animations
   - Feature highlights with checkmarks
   - Skip functionality
   - Interactive navigation dots
   - Modern design with gradient themes:
     - Screen 1: "Find Your Perfect Swap" (Purple gradient)
     - Screen 2: "Connect & Match" (Pink gradient)
     - Screen 3: "Swap with Confidence" (Blue gradient)

2. **Redesigned Authentication Screen**
   - **EDU-Only Focus**: Removed social logins (Apple/Facebook/Google)
   - ".EDU STUDENTS ONLY" badge prominently displayed
   - Real-time .edu email validation with visual feedback
   - University domain auto-detection from email
   - University picker modal with search functionality
   - 20+ pre-populated popular universities
   - Password strength requirements (8+ characters)
   - Password match confirmation for sign-up
   - Gradient header design matching brand
   - Back navigation to onboarding screens
   - Info box explaining why .edu emails are required
   - Full name field for sign-up
   - Smooth animations on form transitions

3. **Main App Navigation**
   - Bottom tab navigation (Home, Search, Messages, Profile)
   - Home screen with featured listings
   - Search screen with filters
   - Messages screen with conversation list
   - Profile screen with user stats

4. **Native iOS Module (Swift)**
   - Student email verification
   - Haptic feedback
   - Device info retrieval
   - Date formatting utilities

#### Backend (API - Basic Setup)
- Express server configured
- TypeScript setup
- Basic folder structure
- Health check endpoint
- CORS enabled

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
- MongoDB (planned)
- JWT for auth (planned)

**Development:**
- Monorepo structure
- Shared TypeScript types
- Hot reload for both frontend/backend

## 📱 Running the Project

### Frontend (Mobile App)
```bash
cd frontend
npm install
npx expo start --ios     # For iOS Simulator
npx expo start           # For Expo Go app on phone
```

### Backend (API)
```bash
cd backend
npm install
npm run dev              # Starts on http://localhost:5000
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

**Latest Updates (Sep 9, 2025 - 4:30 PM):**
- ✅ Enhanced onboarding screens with animations and gradients
- ✅ Redesigned authentication to be .edu email exclusive
- ✅ Added university selection with search functionality
- ✅ Implemented bidirectional navigation (can go back to onboarding from auth)
- ✅ Added real-time email validation with visual feedback
- ✅ Removed social login options to focus on verified students

**Known Issues:**
- Logo file needs to be properly added to `frontend/assets/logo.png`
- Backend is just boilerplate, no actual functionality yet
- Authentication is UI-only, not connected to backend

## 🚦 Next Steps (TODO)

### High Priority
1. [ ] Connect frontend auth to backend API
2. [ ] Implement JWT authentication
3. [ ] Set up MongoDB database
4. [ ] Create user registration/login endpoints

### Backend Implementation
- [ ] User authentication system
- [ ] Listing CRUD operations
- [ ] Swap matching algorithm
- [ ] Messaging system
- [ ] Email verification for .edu addresses

### Frontend Improvements
- [ ] Add actual logo image
- [ ] Connect to backend API
- [ ] Implement real authentication flow
- [ ] Add listing creation screen
- [ ] Implement chat functionality

### DevOps
- [ ] Set up Docker containers
- [ ] Configure CI/CD pipeline
- [ ] Add testing (Jest)
- [ ] Environment configuration

## 🐛 Troubleshooting

### "Native module not available in Expo Go"
- This is expected. Native Swift modules require EAS Build
- App has fallbacks for Expo Go testing

### Logo not displaying
- Add your logo image to: `frontend/assets/logo.png`
- Must be an actual image file (PNG/JPG)

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

**Last Updated:** September 9, 2025, 4:30 PM
**Status:** Frontend enhanced with polished onboarding/auth, Backend boilerplate ready
**Next Session:** Implement backend auth and connect to frontend