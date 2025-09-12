import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createSwapRequest,
  getUserSwapRequests,
  getSwapRequest,
  respondToSwapRequest,
  cancelSwapRequest,
  getListingSwapRequests,
  cleanupExpiredRequests,
  getRequestStatistics
} from '../controllers/swapRequestController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Core swap request routes
router.post('/', createSwapRequest);
router.get('/', getUserSwapRequests);
router.get('/stats', getRequestStatistics);
router.get('/:requestId', getSwapRequest);

// Request actions
router.put('/:requestId/respond', respondToSwapRequest);
router.put('/:requestId/cancel', cancelSwapRequest);

// Listing-specific requests
router.get('/listing/:listingId', getListingSwapRequests);

// Admin/utility routes
router.post('/cleanup-expired', cleanupExpiredRequests);

export default router;