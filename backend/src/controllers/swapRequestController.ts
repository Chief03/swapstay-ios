import { Request, Response } from 'express';
import SwapRequest from '../models/SwapRequest';
import Listing from '../models/Listing';
import User from '../models/User';
import Conversation from '../models/Conversation';
import MatchingService from '../services/matchingService';
import mongoose from 'mongoose';

// Create a new swap request
export const createSwapRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      requestType,
      targetListingId,
      requesterListingId,
      requestedDates,
      message,
      proposedPrice
    } = req.body;

    // Validate required fields
    if (!requestType || !targetListingId || !requestedDates || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate request type specific requirements
    if (requestType === 'SWAP' && !requesterListingId) {
      return res.status(400).json({
        success: false,
        message: 'SWAP requests require a requester listing'
      });
    }

    if (requestType === 'RENT' && !proposedPrice) {
      return res.status(400).json({
        success: false,
        message: 'RENT requests require a proposed price'
      });
    }

    // Get target listing and verify it exists
    const targetListing = await Listing.findById(targetListingId).populate('owner');
    if (!targetListing) {
      return res.status(404).json({
        success: false,
        message: 'Target listing not found'
      });
    }

    // Prevent self-requests
    if (targetListing.owner._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request your own listing'
      });
    }

    // Check if user already has a pending request for this listing
    const existingRequest = await SwapRequest.findOne({
      requester: userId,
      targetListing: targetListingId,
      status: 'PENDING'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this listing'
      });
    }

    let requesterListing = null;
    if (requestType === 'SWAP') {
      // Verify requester owns the listing they're offering
      requesterListing = await Listing.findOne({
        _id: requesterListingId,
        owner: userId
      });

      if (!requesterListing) {
        return res.status(400).json({
          success: false,
          message: 'Requester listing not found or not owned by you'
        });
      }
    }

    // Get requester user info
    const requester = await User.findById(userId);
    if (!requester) {
      return res.status(404).json({
        success: false,
        message: 'Requester not found'
      });
    }

    // Calculate compatibility score
    const matchResult = MatchingService.calculateCompatibilityScore(
      requesterListing,
      targetListing,
      requester,
      {
        startDate: new Date(requestedDates.startDate),
        endDate: new Date(requestedDates.endDate)
      },
      requestType
    );

    // Create the swap request
    const swapRequest = await SwapRequest.create({
      requestType,
      requester: userId,
      listingOwner: targetListing.owner._id,
      targetListing: targetListingId,
      requesterListing: requesterListingId || undefined,
      requestedDates: {
        startDate: new Date(requestedDates.startDate),
        endDate: new Date(requestedDates.endDate)
      },
      message,
      proposedPrice: proposedPrice || undefined,
      compatibilityScore: matchResult.score,
      matchingFactors: matchResult.factors
    });

    // Create or find conversation between users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, targetListing.owner._id] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, targetListing.owner._id],
        listingId: targetListingId
      });
    }

    // Link conversation to request
    swapRequest.conversationId = conversation._id as mongoose.Types.ObjectId;
    await swapRequest.save();

    // Populate response data
    await swapRequest.populate([
      { path: 'requester', select: 'fullName email profilePicture university' },
      { path: 'listingOwner', select: 'fullName email profilePicture university' },
      { path: 'targetListing', select: 'title propertyType listingType address' },
      { path: 'requesterListing', select: 'title propertyType listingType address' }
    ]);

    res.status(201).json({
      success: true,
      swapRequest,
      matchInsights: MatchingService.generateMatchInsights(matchResult.factors)
    });
  } catch (error) {
    console.error('Error creating swap request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create swap request'
    });
  }
};

// Get all swap requests for a user (sent and received)
export const getUserSwapRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type = 'all' } = req.query; // 'sent', 'received', or 'all'

    let query: any = {};
    
    if (type === 'sent') {
      query.requester = userId;
    } else if (type === 'received') {
      query.listingOwner = userId;
    } else {
      query = {
        $or: [
          { requester: userId },
          { listingOwner: userId }
        ]
      };
    }

    const requests = await SwapRequest.find(query)
      .populate('requester', 'fullName email profilePicture university')
      .populate('listingOwner', 'fullName email profilePicture university')
      .populate('targetListing', 'title propertyType listingType address photos rentPrice')
      .populate('requesterListing', 'title propertyType listingType address photos rentPrice')
      .sort({ createdAt: -1 });

    // Separate sent and received requests
    const sentRequests = requests.filter(req => req.requester._id.toString() === userId);
    const receivedRequests = requests.filter(req => req.listingOwner._id.toString() === userId);

    res.json({
      success: true,
      requests: type === 'all' ? requests : (type === 'sent' ? sentRequests : receivedRequests),
      sentCount: sentRequests.length,
      receivedCount: receivedRequests.length,
      pendingSent: sentRequests.filter(r => r.status === 'PENDING').length,
      pendingReceived: receivedRequests.filter(r => r.status === 'PENDING').length
    });
  } catch (error) {
    console.error('Error fetching swap requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch swap requests'
    });
  }
};

// Get a specific swap request by ID
export const getSwapRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { requestId } = req.params;

    const request = await SwapRequest.findById(requestId)
      .populate('requester', 'fullName email profilePicture university')
      .populate('listingOwner', 'fullName email profilePicture university')
      .populate('targetListing')
      .populate('requesterListing');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify user is part of this request
    if (request.requester._id.toString() !== userId && 
        request.listingOwner._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this request'
      });
    }

    const insights = request.matchingFactors ? 
      MatchingService.generateMatchInsights(request.matchingFactors) : [];

    res.json({
      success: true,
      request,
      matchInsights: insights
    });
  } catch (error) {
    console.error('Error fetching swap request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch swap request'
    });
  }
};

// Respond to a swap request (accept/decline)
export const respondToSwapRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { requestId } = req.params;
    const { action, message, counterOffer } = req.body; // action: 'ACCEPT' or 'DECLINE'

    if (!['ACCEPT', 'DECLINE'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be ACCEPT or DECLINE'
      });
    }

    const request = await SwapRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify user is the listing owner
    if (request.listingOwner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the listing owner can respond to this request'
      });
    }

    // Check if request can still be responded to
    const canRespond = request.status === 'PENDING' && request.expiresAt > new Date();
    if (!canRespond) {
      return res.status(400).json({
        success: false,
        message: request.status === 'EXPIRED' ? 'Request has expired' : 'Request has already been responded to'
      });
    }

    // Update request status and response
    request.status = action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';
    request.ownerResponse = {
      message: message || '',
      respondedAt: new Date(),
      counterOffer: counterOffer || undefined
    };

    await request.save();

    // Populate for response
    await request.populate([
      { path: 'requester', select: 'fullName email profilePicture university' },
      { path: 'listingOwner', select: 'fullName email profilePicture university' },
      { path: 'targetListing', select: 'title propertyType listingType address' },
      { path: 'requesterListing', select: 'title propertyType listingType address' }
    ]);

    res.json({
      success: true,
      request,
      message: `Request ${action.toLowerCase()}ed successfully`
    });
  } catch (error) {
    console.error('Error responding to swap request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to swap request'
    });
  }
};

// Cancel a swap request (by requester)
export const cancelSwapRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { requestId } = req.params;

    const request = await SwapRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify user is the requester
    if (request.requester.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel this request'
      });
    }

    // Only allow cancellation of pending requests
    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending requests'
      });
    }

    request.status = 'CANCELLED';
    await request.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling swap request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel swap request'
    });
  }
};

// Get swap requests for a specific listing
export const getListingSwapRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { listingId } = req.params;

    // Verify user owns the listing
    const listing = await Listing.findOne({
      _id: listingId,
      owner: userId
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or not owned by you'
      });
    }

    const requests = await SwapRequest.find({
      targetListing: listingId
    })
    .populate('requester', 'fullName email profilePicture university')
    .populate('requesterListing', 'title propertyType listingType address photos')
    .sort({ compatibilityScore: -1, createdAt: -1 }); // Sort by best matches first

    res.json({
      success: true,
      requests,
      totalCount: requests.length,
      pendingCount: requests.filter(r => r.status === 'PENDING').length
    });
  } catch (error) {
    console.error('Error fetching listing requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing requests'
    });
  }
};

// Cleanup expired requests (admin/cron job endpoint)
export const cleanupExpiredRequests = async (req: Request, res: Response) => {
  try {
    const result = await (SwapRequest as any).cleanupExpired();
    
    res.json({
      success: true,
      message: `Cleaned up ${result.modifiedCount} expired requests`
    });
  } catch (error) {
    console.error('Error cleaning up expired requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired requests'
    });
  }
};

// Get request statistics for user
export const getRequestStatistics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const stats = await SwapRequest.aggregate([
      {
        $match: {
          $or: [
            { requester: new mongoose.Types.ObjectId(userId) },
            { listingOwner: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          sentRequests: {
            $sum: {
              $cond: [{ $eq: ['$requester', new mongoose.Types.ObjectId(userId)] }, 1, 0]
            }
          },
          receivedRequests: {
            $sum: {
              $cond: [{ $eq: ['$listingOwner', new mongoose.Types.ObjectId(userId)] }, 1, 0]
            }
          },
          acceptedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0]
            }
          },
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const statistics = stats[0] || {
      totalRequests: 0,
      sentRequests: 0,
      receivedRequests: 0,
      acceptedRequests: 0,
      pendingRequests: 0
    };

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error fetching request statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request statistics'
    });
  }
};