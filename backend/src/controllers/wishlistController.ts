import { Response } from 'express';
import User from '../models/User';
import Listing from '../models/Listing';
import { AuthRequest } from '../middleware/auth';

// Get user's saved listings (wishlist)
export const getSavedListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedListings.listing',
        populate: {
          path: 'owner',
          select: 'fullName email university profilePicture'
        }
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Format the response with savedAt date
    const formattedSavedListings = user.savedListings?.map((saved: any) => ({
      ...saved.listing.toObject(),
      savedAt: saved.savedAt
    })) || [];

    res.status(200).json({
      success: true,
      savedListings: formattedSavedListings
    });
  } catch (error: any) {
    console.error('Get saved listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved listings',
      error: error.message
    });
  }
};

// Add listing to wishlist
export const saveListingToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    // Check if user already saved this listing
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const alreadySaved = user.savedListings?.some(
      (saved: any) => saved.listing.toString() === listingId
    );

    if (alreadySaved) {
      res.status(400).json({
        success: false,
        message: 'Listing already in wishlist'
      });
      return;
    }

    // Add to wishlist
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          savedListings: {
            listing: listingId,
            savedAt: new Date()
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Listing added to wishlist'
    });
  } catch (error: any) {
    console.error('Save listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving listing',
      error: error.message
    });
  }
};

// Remove listing from wishlist
export const removeListingFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if listing is in wishlist
    const isSaved = user.savedListings?.some(
      (saved: any) => saved.listing.toString() === listingId
    );

    if (!isSaved) {
      res.status(400).json({
        success: false,
        message: 'Listing not in wishlist'
      });
      return;
    }

    // Remove from wishlist
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          savedListings: {
            listing: listingId
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Listing removed from wishlist'
    });
  } catch (error: any) {
    console.error('Remove listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing listing',
      error: error.message
    });
  }
};

// Check if a listing is saved
export const isListingSaved = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isSaved = user.savedListings?.some(
      (saved: any) => saved.listing.toString() === listingId
    ) || false;

    res.status(200).json({
      success: true,
      isSaved
    });
  } catch (error: any) {
    console.error('Check saved status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking saved status',
      error: error.message
    });
  }
};

// Toggle wishlist status (add if not saved, remove if saved)
export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isSaved = user.savedListings?.some(
      (saved: any) => saved.listing.toString() === listingId
    );

    if (isSaved) {
      // Remove from wishlist
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: {
            savedListings: {
              listing: listingId
            }
          }
        }
      );

      res.status(200).json({
        success: true,
        message: 'Listing removed from wishlist',
        isSaved: false
      });
    } else {
      // Add to wishlist
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            savedListings: {
              listing: listingId,
              savedAt: new Date()
            }
          }
        }
      );

      res.status(200).json({
        success: true,
        message: 'Listing added to wishlist',
        isSaved: true
      });
    }
  } catch (error: any) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling wishlist',
      error: error.message
    });
  }
};