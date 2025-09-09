import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  // Owner Information
  owner: mongoose.Types.ObjectId;
  
  // Basic Information
  title: string;
  description: string;
  
  // Listing Type - BOTH, SWAP_ONLY, or RENT_ONLY
  listingType: 'BOTH' | 'SWAP_ONLY' | 'RENT_ONLY';
  
  // Location Details
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  nearUniversity: string;
  distanceToCampus: number; // in miles
  neighborhood: string;
  
  // Property Details
  propertyType: 'APARTMENT' | 'HOUSE' | 'DORM' | 'CONDO' | 'TOWNHOUSE' | 'STUDIO';
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  floor?: number;
  totalFloors?: number;
  
  // Availability
  availableFrom: Date;
  availableTo: Date;
  flexibleDates: boolean;
  minimumStay: number; // in days
  maximumStay?: number; // in days
  
  // Pricing (for rent option)
  rentPrice?: number; // per month
  rentPriceDaily?: number; // calculated daily rate
  securityDeposit?: number;
  utilitiesIncluded: boolean;
  utilitiesEstimate?: number;
  
  // Swap Preferences (for swap option)
  swapPreferences?: {
    desiredLocations: string[]; // cities or universities
    desiredPropertyTypes: string[];
    desiredAmenities: string[];
  };
  
  // Amenities
  amenities: {
    wifi: boolean;
    parking: boolean;
    parkingType?: 'STREET' | 'GARAGE' | 'DRIVEWAY' | 'LOT';
    laundry: boolean;
    laundryType?: 'IN_UNIT' | 'IN_BUILDING' | 'NEARBY';
    airConditioning: boolean;
    heating: boolean;
    furnished: boolean;
    petFriendly: boolean;
    pool: boolean;
    gym: boolean;
    elevator: boolean;
    wheelchair: boolean;
    smoking: boolean;
    kitchen: boolean;
    kitchenType?: 'FULL' | 'KITCHENETTE' | 'SHARED';
  };
  
  // Additional Features
  additionalAmenities: string[]; // Free text amenities
  
  // House Rules
  houseRules: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    guestsAllowed: boolean;
    quietHours?: string;
    additionalRules: string[];
  };
  
  // Photos
  photos: {
    url: string;
    caption?: string;
    isPrimary: boolean;
    order: number;
  }[];
  
  // Status
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'RENTED' | 'SWAPPED';
  verified: boolean;
  featured: boolean;
  
  // Statistics
  views: number;
  favorites: number;
  inquiries: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

const listingSchema = new Schema<IListing>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    
    listingType: {
      type: String,
      enum: ['BOTH', 'SWAP_ONLY', 'RENT_ONLY'],
      default: 'BOTH',
      required: true
    },
    
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        index: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        index: true
      },
      zipCode: {
        type: String,
        required: [true, 'ZIP code is required']
      },
      country: {
        type: String,
        default: 'USA'
      }
    },
    
    nearUniversity: {
      type: String,
      required: [true, 'Nearby university is required'],
      index: true
    },
    
    distanceToCampus: {
      type: Number,
      required: [true, 'Distance to campus is required'],
      min: [0, 'Distance cannot be negative'],
      max: [50, 'Distance seems too far from campus']
    },
    
    neighborhood: {
      type: String,
      maxlength: [100, 'Neighborhood name too long']
    },
    
    propertyType: {
      type: String,
      enum: ['APARTMENT', 'HOUSE', 'DORM', 'CONDO', 'TOWNHOUSE', 'STUDIO'],
      required: [true, 'Property type is required']
    },
    
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
      max: [10, 'Bedrooms seem excessive']
    },
    
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative'],
      max: [10, 'Bathrooms seem excessive']
    },
    
    squareFeet: {
      type: Number,
      min: [100, 'Square feet seems too small'],
      max: [10000, 'Square feet seems too large']
    },
    
    floor: {
      type: Number,
      min: 0,
      max: 100
    },
    
    totalFloors: {
      type: Number,
      min: 1,
      max: 100
    },
    
    availableFrom: {
      type: Date,
      required: [true, 'Available from date is required'],
      index: true
    },
    
    availableTo: {
      type: Date,
      required: [true, 'Available to date is required'],
      index: true,
      validate: {
        validator: function(this: IListing, value: Date) {
          return value > this.availableFrom;
        },
        message: 'End date must be after start date'
      }
    },
    
    flexibleDates: {
      type: Boolean,
      default: false
    },
    
    minimumStay: {
      type: Number,
      default: 7,
      min: [1, 'Minimum stay must be at least 1 day']
    },
    
    maximumStay: {
      type: Number,
      min: [1, 'Maximum stay must be at least 1 day']
    },
    
    rentPrice: {
      type: Number,
      min: [0, 'Rent price cannot be negative'],
      max: [10000, 'Rent price seems too high'],
      required: function(this: IListing) {
        return this.listingType === 'RENT_ONLY' || this.listingType === 'BOTH';
      }
    },
    
    rentPriceDaily: {
      type: Number,
      min: [0, 'Daily rent cannot be negative']
    },
    
    securityDeposit: {
      type: Number,
      min: [0, 'Security deposit cannot be negative'],
      max: [5000, 'Security deposit seems too high']
    },
    
    utilitiesIncluded: {
      type: Boolean,
      default: false
    },
    
    utilitiesEstimate: {
      type: Number,
      min: [0, 'Utilities estimate cannot be negative'],
      max: [1000, 'Utilities estimate seems too high']
    },
    
    swapPreferences: {
      desiredLocations: [String],
      desiredPropertyTypes: [String],
      desiredAmenities: [String]
    },
    
    amenities: {
      wifi: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      parkingType: {
        type: String,
        enum: ['STREET', 'GARAGE', 'DRIVEWAY', 'LOT']
      },
      laundry: { type: Boolean, default: false },
      laundryType: {
        type: String,
        enum: ['IN_UNIT', 'IN_BUILDING', 'NEARBY']
      },
      airConditioning: { type: Boolean, default: false },
      heating: { type: Boolean, default: false },
      furnished: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      pool: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      elevator: { type: Boolean, default: false },
      wheelchair: { type: Boolean, default: false },
      smoking: { type: Boolean, default: false },
      kitchen: { type: Boolean, default: false },
      kitchenType: {
        type: String,
        enum: ['FULL', 'KITCHENETTE', 'SHARED']
      }
    },
    
    additionalAmenities: [String],
    
    houseRules: {
      smokingAllowed: { type: Boolean, default: false },
      petsAllowed: { type: Boolean, default: false },
      guestsAllowed: { type: Boolean, default: true },
      quietHours: String,
      additionalRules: [String]
    },
    
    photos: [{
      url: {
        type: String,
        required: true
      },
      caption: String,
      isPrimary: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'RENTED', 'SWAPPED'],
      default: 'DRAFT',
      index: true
    },
    
    verified: {
      type: Boolean,
      default: false
    },
    
    featured: {
      type: Boolean,
      default: false
    },
    
    views: {
      type: Number,
      default: 0
    },
    
    favorites: {
      type: Number,
      default: 0
    },
    
    inquiries: {
      type: Number,
      default: 0
    },
    
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
listingSchema.index({ status: 1, availableFrom: 1, availableTo: 1 });
listingSchema.index({ nearUniversity: 1, status: 1 });
listingSchema.index({ 'address.city': 1, 'address.state': 1, status: 1 });
listingSchema.index({ listingType: 1, status: 1 });
listingSchema.index({ rentPrice: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ featured: 1, status: 1 });

// Virtual for calculating daily rent
listingSchema.virtual('calculatedDailyRate').get(function(this: IListing) {
  if (this.rentPrice) {
    return Math.round(this.rentPrice / 30); // Approximate monthly to daily
  }
  return null;
});

// Pre-save middleware to calculate daily rate
listingSchema.pre('save', function(next) {
  if (this.rentPrice && !this.rentPriceDaily) {
    this.rentPriceDaily = Math.round(this.rentPrice / 30);
  }
  next();
});

const Listing = mongoose.model<IListing>('Listing', listingSchema);

export default Listing;