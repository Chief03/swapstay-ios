import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: any;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem('authToken', token);
      this.token = token;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async removeToken() {
    try {
      await AsyncStorage.removeItem('authToken');
      this.token = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async register(userData: {
    fullName: string;
    email: string;
    password: string;
    university: string;
    universityDomain: string;
  }): Promise<ApiResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      await this.saveToken(response.token);
    }

    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      await this.saveToken(response.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    if (!this.token) {
      throw new Error('No authentication token');
    }
    
    return this.request('/users/me', {
      method: 'GET',
    });
  }

  // Listing methods
  async getListings(params?: {
    city?: string;
    state?: string;
    nearUniversity?: string;
    listingType?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryString = params ? 
      '?' + new URLSearchParams(params as any).toString() : '';
    
    return this.request(`/listings${queryString}`, {
      method: 'GET',
    });
  }

  async getFeaturedListings(): Promise<ApiResponse> {
    return this.request('/listings/featured', {
      method: 'GET',
    });
  }

  async getListingById(id: string): Promise<ApiResponse> {
    return this.request(`/listings/${id}`, {
      method: 'GET',
    });
  }

  async createListing(listingData: any): Promise<ApiResponse> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id: string, listingData: any): Promise<ApiResponse> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  async deleteListing(id: string): Promise<ApiResponse> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  async searchListings(searchParams: any): Promise<ApiResponse> {
    return this.request('/listings/search', {
      method: 'POST',
      body: JSON.stringify(searchParams),
    });
  }

  async toggleFavorite(listingId: string): Promise<ApiResponse> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    return this.request(`/listings/${listingId}/favorite`, {
      method: 'POST',
    });
  }

  async getUserListings(userId?: string): Promise<ApiResponse> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const endpoint = userId ? `/listings/user/${userId}` : '/listings/user';
    return this.request(endpoint, {
      method: 'GET',
    });
  }
}

export default new ApiService();