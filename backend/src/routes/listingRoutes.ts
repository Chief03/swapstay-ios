import { Router } from 'express';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getUserListings,
  toggleFavorite,
  searchListings,
  getFeaturedListings,
  getListingsByUniversity
} from '../controllers/listingController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (no auth required)
router.get('/', getListings); // Get all listings with filters
router.get('/featured', getFeaturedListings); // Get featured listings
router.get('/university/:university', getListingsByUniversity); // Get listings by university
router.get('/:id', getListingById); // Get single listing
router.post('/search', searchListings); // Advanced search

// Protected routes (auth required)
router.post('/', authenticate, createListing); // Create new listing
router.put('/:id', authenticate, updateListing); // Update listing
router.delete('/:id', authenticate, deleteListing); // Delete listing
router.get('/user/:userId?', authenticate, getUserListings); // Get user's listings
router.post('/:id/favorite', authenticate, toggleFavorite); // Toggle favorite

export default router;