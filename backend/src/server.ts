import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import listingRoutes from './routes/listingRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwapStay Backend API'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);

app.get('/api/v1', (req, res) => {
  res.json({
    message: 'SwapStay API v1',
    endpoints: {
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        verifyEmail: 'GET /api/v1/auth/verify-email/:token',
        resendVerification: 'POST /api/v1/auth/resend-verification'
      },
      listings: {
        getAll: 'GET /api/v1/listings',
        getFeatured: 'GET /api/v1/listings/featured',
        getByUniversity: 'GET /api/v1/listings/university/:university',
        getById: 'GET /api/v1/listings/:id',
        search: 'POST /api/v1/listings/search',
        create: 'POST /api/v1/listings (auth required)',
        update: 'PUT /api/v1/listings/:id (auth required)',
        delete: 'DELETE /api/v1/listings/:id (auth required)',
        getUserListings: 'GET /api/v1/listings/user/:userId (auth required)',
        toggleFavorite: 'POST /api/v1/listings/:id/favorite (auth required)'
      },
      users: '/api/v1/users (coming soon)',
      swaps: '/api/v1/swaps (coming soon)',
      messages: '/api/v1/messages (coming soon)'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SwapStay Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoints: http://localhost:${PORT}/api/v1`);
});