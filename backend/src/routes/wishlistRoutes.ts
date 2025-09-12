import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSavedListings,
  saveListingToWishlist,
  removeListingFromWishlist,
  isListingSaved,
  toggleWishlist
} from '../controllers/wishlistController';

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

// Get all saved listings
router.get('/', getSavedListings);

// Add listing to wishlist
router.post('/:listingId', saveListingToWishlist);

// Remove listing from wishlist
router.delete('/:listingId', removeListingFromWishlist);

// Check if listing is saved
router.get('/check/:listingId', isListingSaved);

// Toggle wishlist status
router.post('/toggle/:listingId', toggleWishlist);

export default router;