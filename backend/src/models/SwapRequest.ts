import mongoose, { Document, Schema } from 'mongoose';

export interface ISwapRequest extends Document {
  requestType: 'SWAP' | 'RENT';
  requester: mongoose.Types.ObjectId;
  listingOwner: mongoose.Types.ObjectId;
  targetListing: mongoose.Types.ObjectId;
  requesterListing?: mongoose.Types.ObjectId; // Only for SWAP requests
  
  // Request details
  requestedDates: {
    startDate: Date;
    endDate: Date;
  };
  message: string;
  
  // Pricing (for rent requests)
  proposedPrice?: number;
  
  // Status management
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  
  // Matching and compatibility
  compatibilityScore?: number;
  matchingFactors?: {
    dateOverlap: number;
    distanceMatch: number;
    propertyTypeMatch: number;
    universityMatch: number;
    overallScore: number;
  };
  
  // Response from owner
  ownerResponse?: {
    message?: string;
    respondedAt: Date;
    counterOffer?: {
      price?: number;
      dates?: {
        startDate: Date;
        endDate: Date;
      };
    };
  };
  
  // Expiry and cleanup
  expiresAt: Date;
  
  // Conversation reference
  conversationId?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const SwapRequestSchema = new Schema<ISwapRequest>({
  requestType: {
    type: String,
    enum: ['SWAP', 'RENT'],
    required: true
  },
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  listingOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetListing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
    index: true
  },
  requesterListing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  },
  requestedDates: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  proposedPrice: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING',
    index: true
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchingFactors: {
    dateOverlap: { type: Number, min: 0, max: 100 },
    distanceMatch: { type: Number, min: 0, max: 100 },
    propertyTypeMatch: { type: Number, min: 0, max: 100 },
    universityMatch: { type: Number, min: 0, max: 100 },
    overallScore: { type: Number, min: 0, max: 100 }
  },
  ownerResponse: {
    message: String,
    respondedAt: Date,
    counterOffer: {
      price: Number,
      dates: {
        startDate: Date,
        endDate: Date
      }
    }
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
SwapRequestSchema.index({ requester: 1, status: 1 });
SwapRequestSchema.index({ listingOwner: 1, status: 1 });
SwapRequestSchema.index({ targetListing: 1, status: 1 });
SwapRequestSchema.index({ expiresAt: 1 }); // For cleanup jobs
SwapRequestSchema.index({ createdAt: -1 });
SwapRequestSchema.index({ compatibilityScore: -1 });

// Pre-save middleware to set expiry date
SwapRequestSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiry to 7 days from creation
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Validation to ensure swap requests have requesterListing
SwapRequestSchema.pre('save', function(next) {
  if (this.requestType === 'SWAP' && !this.requesterListing) {
    next(new Error('SWAP requests must include a requester listing'));
  } else if (this.requestType === 'RENT' && !this.proposedPrice) {
    next(new Error('RENT requests must include a proposed price'));
  } else {
    next();
  }
});

// Static method to cleanup expired requests
SwapRequestSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { 
      status: 'PENDING',
      expiresAt: { $lt: new Date() }
    },
    { 
      status: 'EXPIRED' 
    }
  );
};

// Instance method to check if request can be responded to
SwapRequestSchema.methods.canRespond = function(): boolean {
  return this.status === 'PENDING' && this.expiresAt > new Date();
};

// Instance method to calculate days until expiry
SwapRequestSchema.methods.daysUntilExpiry = function(): number {
  const now = new Date();
  const diffTime = this.expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const SwapRequest = mongoose.model<ISwapRequest>('SwapRequest', SwapRequestSchema);

export default SwapRequest;