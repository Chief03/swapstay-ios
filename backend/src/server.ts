import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwapStay Backend API'
  });
});

// API Routes (to be implemented)
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'SwapStay API v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      listings: '/api/v1/listings',
      swaps: '/api/v1/swaps',
      messages: '/api/v1/messages'
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