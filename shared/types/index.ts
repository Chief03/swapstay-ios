// Shared TypeScript types used by both frontend and backend

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  university: string;
  universityEmail: string;
  isVerified: boolean;
  profilePicture?: string;
  bio?: string;
  rating?: number;
  swapsCompleted: number;
  joinedDate: Date;
  lastActive: Date;
}

export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  university: string;
  images: string[];
  propertyType: 'entire_place' | 'private_room' | 'shared_room';
  amenities: string[];
  availableFrom: Date;
  availableTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Swap {
  id: string;
  listing1Id: string;
  listing2Id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  messages?: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  swapId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  timestamp: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}