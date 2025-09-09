// Shared constants used across the application

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.swapstay.com' 
  : 'http://localhost:5000';

export const APP_NAME = 'SwapStay';
export const APP_TAGLINE = 'Your College Housing Exchange';

export const PROPERTY_TYPES = {
  ENTIRE_PLACE: 'entire_place',
  PRIVATE_ROOM: 'private_room',
  SHARED_ROOM: 'shared_room'
} as const;

export const SWAP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const AMENITIES = [
  'WiFi',
  'Parking',
  'Laundry',
  'Kitchen',
  'Air Conditioning',
  'Heating',
  'Workspace',
  'TV',
  'Pool',
  'Gym',
  'Pet Friendly',
  'Wheelchair Accessible'
] as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_EDU: 'Please use your university .edu email address',
  USER_NOT_FOUND: 'User not found',
  LISTING_NOT_FOUND: 'Listing not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SERVER_ERROR: 'An error occurred. Please try again later.'
} as const;

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully! Please check your email to verify.',
  LOGIN_SUCCESS: 'Welcome back!',
  LISTING_CREATED: 'Your listing has been created successfully',
  SWAP_REQUEST_SENT: 'Swap request sent successfully',
  PROFILE_UPDATED: 'Your profile has been updated'
} as const;