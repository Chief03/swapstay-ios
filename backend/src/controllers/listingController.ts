import { Request, Response } from 'express';
import Listing, { IListing } from '../models/Listing';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Create a new listing
export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingData = {
      ...req.body,
      owner: req.user._id,
      status: 'ACTIVE'
    };
    
    const listing = await Listing.create(listingData);
    
    // Add listing to user's listings array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { listings: listing._id } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing
    });
  } catch (error: any) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating listing',
      error: error.message
    });
  }
};

// Get all listings with filters
export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      city,
      state,
      nearUniversity,
      listingType,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      availableFrom,
      availableTo,
      status = 'ACTIVE',
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    const query: any = { status };
    
    if (city) query['address.city'] = new RegExp(city as string, 'i');
    if (state) query['address.state'] = state;
    if (nearUniversity) query.nearUniversity = new RegExp(nearUniversity as string, 'i');
    if (listingType) query.listingType = listingType;
    if (propertyType) query.propertyType = propertyType;
    if (bedrooms) query.bedrooms = parseInt(bedrooms as string);
    
    if (minPrice || maxPrice) {
      query.rentPrice = {};
      if (minPrice) query.rentPrice.$gte = parseInt(minPrice as string);
      if (maxPrice) query.rentPrice.$lte = parseInt(maxPrice as string);
    }
    
    if (availableFrom) {
      query.availableFrom = { $lte: new Date(availableFrom as string) };
    }
    
    if (availableTo) {
      query.availableTo = { $gte: new Date(availableTo as string) };
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const listings = await Listing
      .find(query)
      .populate('owner', 'fullName email university profilePicture')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Listing.countDocuments(query);
    
    res.status(200).json({
      success: true,
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listings',
      error: error.message
    });
  }
};

// Get single listing by ID
export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const listing = await Listing
      .findById(id)
      .populate('owner', 'fullName email university profilePicture bio yearInSchool major');
    
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }
    
    // Increment view count
    listing.views += 1;
    await listing.save();
    
    res.status(200).json({
      success: true,
      listing
    });
  } catch (error: any) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listing',
      error: error.message
    });
  }
};

// Update listing
export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const listing = await Listing.findById(id);
    
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }
    
    // Check if user owns the listing
    if (listing.owner.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own listings'
      });
      return;
    }
    
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body, lastActive: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error: any) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating listing',
      error: error.message
    });
  }
};

// Delete listing
export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const listing = await Listing.findById(id);
    
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }
    
    // Check if user owns the listing
    if (listing.owner.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own listings'
      });
      return;
    }
    
    await Listing.findByIdAndDelete(id);
    
    // Remove listing from user's listings array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { listings: id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting listing',
      error: error.message
    });
  }
};

// Get user's listings
export const getUserListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const listings = await Listing
      .find({ owner: userId })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      listings
    });
  } catch (error: any) {
    console.error('Get user listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user listings',
      error: error.message
    });
  }
};

// Toggle favorite listing
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const listing = await Listing.findById(id);
    
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }
    
    // For now, just increment/decrement the favorites count
    // In a full implementation, you'd track which users favorited which listings
    listing.favorites += 1;
    await listing.save();
    
    res.status(200).json({
      success: true,
      message: 'Favorite toggled successfully',
      favorites: listing.favorites
    });
  } catch (error: any) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite',
      error: error.message
    });
  }
};

// Search listings (advanced search with multiple criteria)
export const searchListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      query: searchQuery,
      universities,
      cities,
      listingTypes,
      propertyTypes,
      minBedrooms,
      maxBedrooms,
      amenities,
      minPrice,
      maxPrice,
      availableFrom,
      availableTo,
      page = 1,
      limit = 20
    } = req.body;
    
    const query: any = { status: 'ACTIVE' };
    
    // Text search in title and description
    if (searchQuery) {
      query.$or = [
        { title: new RegExp(searchQuery, 'i') },
        { description: new RegExp(searchQuery, 'i') },
        { nearUniversity: new RegExp(searchQuery, 'i') },
        { 'address.city': new RegExp(searchQuery, 'i') }
      ];
    }
    
    // Filter by universities (array)
    if (universities && universities.length > 0) {
      query.nearUniversity = { $in: universities };
    }
    
    // Filter by cities (array)
    if (cities && cities.length > 0) {
      query['address.city'] = { $in: cities };
    }
    
    // Filter by listing types (array)
    if (listingTypes && listingTypes.length > 0) {
      query.listingType = { $in: listingTypes };
    }
    
    // Filter by property types (array)
    if (propertyTypes && propertyTypes.length > 0) {
      query.propertyType = { $in: propertyTypes };
    }
    
    // Bedroom range
    if (minBedrooms || maxBedrooms) {
      query.bedrooms = {};
      if (minBedrooms) query.bedrooms.$gte = minBedrooms;
      if (maxBedrooms) query.bedrooms.$lte = maxBedrooms;
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.rentPrice = {};
      if (minPrice) query.rentPrice.$gte = minPrice;
      if (maxPrice) query.rentPrice.$lte = maxPrice;
    }
    
    // Date range
    if (availableFrom) {
      query.availableFrom = { $lte: new Date(availableFrom) };
    }
    if (availableTo) {
      query.availableTo = { $gte: new Date(availableTo) };
    }
    
    // Amenities filter (must have all specified amenities)
    if (amenities && amenities.length > 0) {
      amenities.forEach((amenity: string) => {
        query[`amenities.${amenity}`] = true;
      });
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const listings = await Listing
      .find(query)
      .populate('owner', 'fullName email university profilePicture')
      .sort('-featured -createdAt')
      .skip(skip)
      .limit(limitNum);
    
    const total = await Listing.countDocuments(query);
    
    res.status(200).json({
      success: true,
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Search listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching listings',
      error: error.message
    });
  }
};

// Get featured listings for homepage
export const getFeaturedListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const listings = await Listing
      .find({ status: 'ACTIVE', featured: true })
      .populate('owner', 'fullName university profilePicture')
      .sort('-createdAt')
      .limit(6);
    
    res.status(200).json({
      success: true,
      listings
    });
  } catch (error: any) {
    console.error('Get featured listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured listings',
      error: error.message
    });
  }
};

// Get listings near a specific university
export const getListingsByUniversity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { university } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const listings = await Listing
      .find({
        status: 'ACTIVE',
        nearUniversity: new RegExp(university, 'i')
      })
      .populate('owner', 'fullName university profilePicture')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);
    
    const total = await Listing.countDocuments({
      status: 'ACTIVE',
      nearUniversity: new RegExp(university, 'i')
    });
    
    res.status(200).json({
      success: true,
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get listings by university error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching university listings',
      error: error.message
    });
  }
};