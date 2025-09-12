import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from '../models/Listing';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swapstay';

const sampleListings = [
  {
    title: 'Furnished Studio Near Stanford University',
    description: 'Cozy furnished studio apartment perfect for students. Includes all utilities and high-speed internet. Walking distance to campus.',
    listingType: 'BOTH',
    propertyType: 'STUDIO',
    address: {
      street: '123 University Ave',
      city: 'Palo Alto',
      state: 'CA',
      zipCode: '94301',
      country: 'USA'
    },
    nearUniversity: 'Stanford University',
    distanceToCampus: 0.5,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 500,
    rentPrice: 1800,
    availableFrom: new Date('2025-01-01'),
    availableTo: new Date('2025-12-31'),
    flexibleDates: true,
    minimumStay: 30,
    utilitiesIncluded: true,
    amenities: {
      furnished: true,
      wifi: true,
      laundry: true,
      kitchen: true,
      parking: false,
      airConditioning: false,
      heating: true,
      petFriendly: false,
      pool: false,
      gym: false,
      elevator: false,
      wheelchair: false,
      smoking: false
    },
    houseRules: {
      smoking: false,
      pets: false,
      parties: false,
      visitors: true,
      quietHours: '10pm-8am'
    }
  },
  {
    title: 'Modern Apartment with Dedicated Parking',
    description: 'Spacious 2BR apartment with dedicated parking spot. Perfect for students or young professionals. Close to campus and shopping.',
    listingType: 'RENT_ONLY',
    propertyType: 'APARTMENT',
    address: {
      street: '456 College St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78705',
      country: 'USA'
    },
    nearUniversity: 'University of Texas at Austin',
    distanceToCampus: 1.2,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 950,
    rentPrice: 2200,
    availableFrom: new Date('2025-01-15'),
    availableTo: new Date('2025-08-15'),
    flexibleDates: false,
    minimumStay: 60,
    utilitiesIncluded: false,
    utilitiesEstimate: 150,
    amenities: {
      furnished: false,
      parking: true,
      parkingType: 'GARAGE',
      wifi: false,
      laundry: true,
      laundryType: 'IN_BUILDING',
      kitchen: true,
      airConditioning: true,
      heating: true,
      petFriendly: false,
      pool: true,
      gym: true,
      elevator: true,
      wheelchair: true,
      smoking: false
    },
    houseRules: {
      smoking: false,
      pets: false,
      parties: false,
      visitors: true,
      quietHours: '11pm-7am'
    }
  },
  {
    title: 'Fully Furnished House with Two Parking Spaces',
    description: 'Beautiful 3BR house, fully furnished with 2 parking spaces. Perfect for families or groups. Quiet neighborhood near UC Berkeley.',
    listingType: 'SWAP_ONLY',
    propertyType: 'HOUSE',
    address: {
      street: '789 Campus Dr',
      city: 'Berkeley',
      state: 'CA',
      zipCode: '94720',
      country: 'USA'
    },
    nearUniversity: 'UC Berkeley',
    distanceToCampus: 0.8,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    availableFrom: new Date('2025-02-01'),
    availableTo: new Date('2025-07-31'),
    flexibleDates: true,
    minimumStay: 30,
    amenities: {
      furnished: true,
      parking: true,
      parkingType: 'DRIVEWAY',
      wifi: true,
      laundry: true,
      laundryType: 'IN_UNIT',
      kitchen: true,
      kitchenType: 'FULL',
      airConditioning: false,
      heating: true,
      petFriendly: true,
      pool: false,
      gym: false,
      elevator: false,
      wheelchair: false,
      smoking: false
    },
    swapPreferences: {
      desiredLocations: ['Los Angeles', 'San Diego', 'Seattle'],
      desiredUniversities: ['UCLA', 'UCSD', 'University of Washington'],
      desiredPropertyTypes: ['APARTMENT', 'HOUSE', 'CONDO'],
      desiredAmenities: ['parking', 'laundry', 'kitchen']
    },
    houseRules: {
      smoking: false,
      pets: true,
      parties: false,
      visitors: true,
      quietHours: '10pm-8am',
      additionalRules: ['Pets must be approved', 'Maintain yard']
    }
  },
  {
    title: 'Luxury Downtown Loft - Furnished with Valet Parking',
    description: 'Stunning loft in downtown Boston, fully furnished with valet parking service. Walking distance to BU campus and nightlife.',
    listingType: 'BOTH',
    propertyType: 'CONDO',
    address: {
      street: '321 Downtown Blvd',
      city: 'Boston',
      state: 'MA',
      zipCode: '02115',
      country: 'USA'
    },
    nearUniversity: 'Boston University',
    distanceToCampus: 1.5,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 800,
    rentPrice: 2800,
    availableFrom: new Date('2025-01-01'),
    availableTo: new Date('2025-06-30'),
    flexibleDates: false,
    minimumStay: 30,
    utilitiesIncluded: true,
    amenities: {
      furnished: true,
      parking: true,
      parkingType: 'GARAGE',
      wifi: true,
      laundry: true,
      laundryType: 'IN_BUILDING',
      kitchen: true,
      kitchenType: 'FULL',
      airConditioning: true,
      heating: true,
      petFriendly: false,
      pool: false,
      gym: true,
      elevator: true,
      wheelchair: true,
      smoking: false
    },
    houseRules: {
      smoking: false,
      pets: false,
      parties: false,
      visitors: true,
      quietHours: '11pm-7am',
      additionalRules: ['Professional tenants preferred']
    }
  },
  {
    title: 'Budget Room Near Texas Tech - Simple and Clean',
    description: 'Simple, affordable room perfect for budget-conscious students. Shared kitchen and bathroom. Great location near campus.',
    listingType: 'RENT_ONLY',
    propertyType: 'APARTMENT',
    address: {
      street: '555 Student Way',
      city: 'Lubbock',
      state: 'TX',
      zipCode: '79409',
      country: 'USA'
    },
    nearUniversity: 'Texas Tech University',
    distanceToCampus: 0.3,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 400,
    rentPrice: 600,
    availableFrom: new Date('2025-01-10'),
    availableTo: new Date('2025-05-20'),
    flexibleDates: true,
    minimumStay: 30,
    utilitiesIncluded: true,
    amenities: {
      furnished: false,
      parking: false,
      wifi: true,
      laundry: false,
      kitchen: true,
      kitchenType: 'SHARED',
      airConditioning: true,
      heating: true,
      petFriendly: false,
      pool: false,
      gym: false,
      elevator: false,
      wheelchair: false,
      smoking: false
    },
    houseRules: {
      smoking: false,
      pets: false,
      parties: false,
      visitors: true,
      quietHours: '10pm-8am',
      additionalRules: ['Shared kitchen - clean after use', 'Quiet study environment']
    }
  }
];

async function addSampleListings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user to assign as owner (use the test user)
    const user = await User.findOne({ email: 'test@stanford.edu' });
    if (!user) {
      console.error('Test user not found. Please create test@stanford.edu first.');
      process.exit(1);
    }

    // Clear existing listings
    await Listing.deleteMany({});
    console.log('Cleared existing listings');

    // Add sample listings
    for (const listingData of sampleListings) {
      const listing = await Listing.create({
        ...listingData,
        owner: user._id,
        status: 'ACTIVE'
      });
      console.log(`Created listing: ${listing.title}`);
    }

    console.log(`\n✅ Successfully added ${sampleListings.length} sample listings`);
    console.log('Listings include:');
    console.log('- 3 with "furnished" amenity');
    console.log('- 3 with "parking" amenity');
    console.log('- 2 with both "furnished" and "parking"');
    console.log('- 1 with neither special amenity');

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample listings:', error);
    process.exit(1);
  }
}

addSampleListings();