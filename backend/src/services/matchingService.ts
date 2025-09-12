import { IListing } from '../models/Listing';
import { IUser } from '../models/User';

interface MatchingFactors {
  dateOverlap: number;
  distanceMatch: number;
  propertyTypeMatch: number;
  universityMatch: number;
  overallScore: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class MatchingService {
  
  /**
   * Calculate compatibility score between requester and target listing
   */
  static calculateCompatibilityScore(
    requesterListing: IListing | null,
    targetListing: IListing,
    requester: IUser,
    requestedDates: DateRange,
    requestType: 'SWAP' | 'RENT'
  ): { score: number; factors: MatchingFactors } {
    
    let factors: MatchingFactors = {
      dateOverlap: 0,
      distanceMatch: 0,
      propertyTypeMatch: 0,
      universityMatch: 0,
      overallScore: 0
    };
    
    // 1. Date compatibility (30% weight)
    factors.dateOverlap = this.calculateDateOverlap(
      requestedDates,
      {
        startDate: new Date(targetListing.availableFrom),
        endDate: new Date(targetListing.availableTo)
      }
    );
    
    // 2. Distance/Location matching (20% weight)
    if (requesterListing && requestType === 'SWAP') {
      factors.distanceMatch = this.calculateLocationMatch(
        requesterListing.nearUniversity,
        targetListing.nearUniversity
      );
    } else {
      // For rent requests, assume perfect location match since they're seeking this specific location
      factors.distanceMatch = 100;
    }
    
    // 3. Property type compatibility (25% weight)
    if (requesterListing && requestType === 'SWAP') {
      factors.propertyTypeMatch = this.calculatePropertyTypeMatch(
        requesterListing,
        targetListing
      );
    } else {
      // For rent requests, property type matching is less critical
      factors.propertyTypeMatch = 80;
    }
    
    // 4. University/Academic matching (25% weight)
    factors.universityMatch = this.calculateUniversityMatch(
      requester.university,
      targetListing.nearUniversity
    );
    
    // Calculate weighted overall score
    factors.overallScore = Math.round(
      (factors.dateOverlap * 0.30) +
      (factors.distanceMatch * 0.20) +
      (factors.propertyTypeMatch * 0.25) +
      (factors.universityMatch * 0.25)
    );
    
    return {
      score: factors.overallScore,
      factors
    };
  }
  
  /**
   * Calculate date overlap percentage
   */
  private static calculateDateOverlap(
    requestedRange: DateRange,
    availableRange: DateRange
  ): number {
    const requestStart = requestedRange.startDate.getTime();
    const requestEnd = requestedRange.endDate.getTime();
    const availStart = availableRange.startDate.getTime();
    const availEnd = availableRange.endDate.getTime();
    
    // Find overlap period
    const overlapStart = Math.max(requestStart, availStart);
    const overlapEnd = Math.min(requestEnd, availEnd);
    
    if (overlapStart >= overlapEnd) {
      return 0; // No overlap
    }
    
    const requestDuration = requestEnd - requestStart;
    const overlapDuration = overlapEnd - overlapStart;
    
    // Calculate percentage of requested duration that overlaps
    const overlapPercentage = (overlapDuration / requestDuration) * 100;
    
    return Math.min(100, Math.round(overlapPercentage));
  }
  
  /**
   * Calculate location/university compatibility
   */
  private static calculateLocationMatch(
    requesterUniversity: string,
    targetUniversity: string
  ): number {
    if (requesterUniversity === targetUniversity) {
      return 100; // Same university area
    }
    
    // Define university clusters/regions for partial matching
    const universityRegions: Record<string, string[]> = {
      'California': [
        'Stanford University',
        'UC Berkeley',
        'UCLA',
        'USC',
        'UC San Diego',
        'UC Davis'
      ],
      'Northeast': [
        'Harvard University',
        'MIT',
        'Yale University',
        'Columbia University',
        'NYU',
        'Boston University'
      ],
      'Texas': [
        'University of Texas at Austin',
        'Texas Tech University',
        'Texas A&M University',
        'Rice University',
        'SMU'
      ],
      'Midwest': [
        'University of Chicago',
        'Northwestern University',
        'University of Michigan',
        'Notre Dame'
      ]
    };
    
    // Check if both universities are in the same region
    for (const region in universityRegions) {
      const universities = universityRegions[region];
      if (universities.includes(requesterUniversity) && 
          universities.includes(targetUniversity)) {
        return 75; // Same region
      }
    }
    
    return 50; // Different regions but still possible
  }
  
  /**
   * Calculate property type compatibility
   */
  private static calculatePropertyTypeMatch(
    requesterListing: IListing,
    targetListing: IListing
  ): number {
    let score = 0;
    
    // Exact property type match
    if (requesterListing.propertyType === targetListing.propertyType) {
      score += 40;
    } else {
      // Partial matches for compatible types
      const compatibilityMap: Record<string, string[]> = {
        'APARTMENT': ['STUDIO', 'CONDO'],
        'STUDIO': ['APARTMENT'],
        'CONDO': ['APARTMENT'],
        'HOUSE': ['TOWNHOUSE'],
        'TOWNHOUSE': ['HOUSE'],
        'DORM': ['APARTMENT', 'STUDIO']
      };
      
      const compatible = compatibilityMap[requesterListing.propertyType] || [];
      if (compatible.includes(targetListing.propertyType)) {
        score += 25;
      } else {
        score += 10; // Any housing is better than none
      }
    }
    
    // Bedroom compatibility
    const bedroomDiff = Math.abs(requesterListing.bedrooms - targetListing.bedrooms);
    if (bedroomDiff === 0) {
      score += 30;
    } else if (bedroomDiff === 1) {
      score += 20;
    } else if (bedroomDiff === 2) {
      score += 10;
    }
    
    // Bathroom compatibility
    const bathroomDiff = Math.abs(requesterListing.bathrooms - targetListing.bathrooms);
    if (bathroomDiff <= 0.5) {
      score += 20;
    } else if (bathroomDiff <= 1) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Amenities match
    if (requesterListing.amenities && targetListing.amenities) {
      // Convert amenities objects to arrays of available amenities
      const requesterAmenities = Object.keys(requesterListing.amenities).filter(
        key => (requesterListing.amenities as any)[key] === true
      );
      const targetAmenities = Object.keys(targetListing.amenities).filter(
        key => (targetListing.amenities as any)[key] === true
      );
      
      const requesterSet = new Set(requesterAmenities);
      const targetSet = new Set(targetAmenities);
      const intersection = new Set([...requesterSet].filter(x => targetSet.has(x)));
      const union = new Set([...requesterSet, ...targetSet]);
      
      if (union.size > 0) {
        const amenityMatch = (intersection.size / union.size) * 10;
        score += amenityMatch;
      }
    }
    
    return Math.min(100, Math.round(score));
  }
  
  /**
   * Calculate university matching score
   */
  private static calculateUniversityMatch(
    requesterUniversity: string,
    targetUniversity: string
  ): number {
    if (requesterUniversity === targetUniversity) {
      return 100; // Same university - perfect for campus proximity
    }
    
    // Check if it's a reasonable academic exchange
    const prestigeMap: Record<string, number> = {
      'Harvard University': 5,
      'Stanford University': 5,
      'MIT': 5,
      'Yale University': 5,
      'Columbia University': 4,
      'UC Berkeley': 4,
      'UCLA': 4,
      'University of Chicago': 4,
      'Northwestern University': 3,
      'NYU': 3,
      'University of Michigan': 3,
      'Texas Tech University': 2,
      'University of Texas at Austin': 3
    };
    
    const requesterTier = prestigeMap[requesterUniversity] || 2;
    const targetTier = prestigeMap[targetUniversity] || 2;
    const tierDiff = Math.abs(requesterTier - targetTier);
    
    if (tierDiff === 0) return 85; // Same tier
    if (tierDiff === 1) return 70; // Adjacent tier
    if (tierDiff === 2) return 55; // Two tiers apart
    
    return 40; // Very different tiers but still academic
  }
  
  /**
   * Generate match insights for UI display
   */
  static generateMatchInsights(factors: MatchingFactors): string[] {
    const insights: string[] = [];
    
    if (factors.dateOverlap >= 90) {
      insights.push("Perfect date alignment! 📅");
    } else if (factors.dateOverlap >= 70) {
      insights.push("Great date compatibility 📅");
    } else if (factors.dateOverlap < 50) {
      insights.push("Limited date overlap ⚠️");
    }
    
    if (factors.distanceMatch >= 90) {
      insights.push("Same university area! 🎓");
    } else if (factors.distanceMatch >= 75) {
      insights.push("Same region 🌍");
    }
    
    if (factors.propertyTypeMatch >= 85) {
      insights.push("Perfect property match 🏠");
    } else if (factors.propertyTypeMatch >= 70) {
      insights.push("Compatible properties 🏠");
    }
    
    if (factors.universityMatch >= 90) {
      insights.push("Same university! 🎓");
    } else if (factors.universityMatch >= 70) {
      insights.push("Academic compatibility ✅");
    }
    
    if (factors.overallScore >= 90) {
      insights.push("Excellent match! ⭐");
    } else if (factors.overallScore >= 80) {
      insights.push("Great compatibility! ⭐");
    } else if (factors.overallScore >= 70) {
      insights.push("Good potential match ⭐");
    }
    
    return insights;
  }
}

export default MatchingService;