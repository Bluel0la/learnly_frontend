import { apiGet, apiPost, apiPut, apiRequest, publicPost } from '@/lib/apiClient';
import { secureTokenStorage } from './secureTokenStorage';
import { rateLimiter } from '@/lib/security';
import { ErrorRecoveryService } from './errorRecovery';

// Types for API requests and responses
export interface SignupRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  user_id?: string;
  first_name: string;
  last_name: string;
  // Normalized aliases (backend GET /me uses snake_case, update uses plain).
  firstname?: string;
  lastname?: string;
  gender?: string;
  age?: number;
  email: string;
  educational_level?: string;
}

export interface ProfileUpdateRequest {
  firstname?: string;
  lastname?: string;
  educational_level?: string;
  age?: number;
}

interface RawProfile {
  user_id?: string;
  id?: string;
  first_name?: string;
  firstname?: string;
  last_name?: string;
  lastname?: string;
  email: string;
  gender?: string;
  age?: number;
  educational_level?: string;
}

function normalizeProfile(raw: RawProfile): UserProfile {
  return {
    ...raw,
    user_id: raw.user_id ?? raw.id,
    first_name: raw.first_name ?? raw.firstname ?? '',
    last_name: raw.last_name ?? raw.lastname ?? '',
    firstname: raw.firstname ?? raw.first_name,
    lastname: raw.lastname ?? raw.last_name,
  };
}

// Authentication API service
export const authApi = {
  // Register a new user
  signup: async (userData: SignupRequest): Promise<unknown> => {
    // Rate limiting check
    if (!rateLimiter.isAllowed('signup', 3, 15 * 60 * 1000)) {
      throw new Error('Too many signup attempts. Please try again later.');
    }

    return ErrorRecoveryService.withRetry(
      () => publicPost('/auth/signup', userData, 'Registration failed'),
      'auth-signup',
      { maxRetries: 2, fallbackMessage: 'Registration failed. Please try again.' },
    );
  },

  // Login a user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Rate limiting check
    if (!rateLimiter.isAllowed(`login_${credentials.email}`, 5, 15 * 60 * 1000)) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    return ErrorRecoveryService.withRetry(async () => {
      const result = await publicPost<LoginResponse>('/auth/login', credentials, 'Login failed');

      // Set token with expiration when login is successful
      secureTokenStorage.setToken(result.access_token);

      // Reset rate limiting on successful login
      rateLimiter.reset(`login_${credentials.email}`);

      return result;
    }, 'auth-login', {
      maxRetries: 2,
      fallbackMessage: 'Login failed. Please check your credentials and try again.'
    });
  },

  // Logout a user
  logout: async (): Promise<void> => {
    try {
      if (!secureTokenStorage.getToken()) return;
      await apiPost('/auth/logout', undefined, 'Logout failed');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token from storage, even if request fails
      secureTokenStorage.removeToken();
    }
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return ErrorRecoveryService.withRetry(async () => {
      const raw = await apiGet<RawProfile>('/auth/me', 'Failed to fetch profile');
      return normalizeProfile(raw);
    }, 'auth-profile', {
      maxRetries: 3,
      fallbackMessage: 'Unable to load profile. Please try again.'
    });
  },

  // Update user profile
  updateProfile: async (profileData: ProfileUpdateRequest): Promise<{ message: string; user_id: string }> => {
    return ErrorRecoveryService.withRetry(
      () => apiPut('/auth/update', profileData, 'Profile update failed'),
      'auth-update-profile',
      { maxRetries: 2, fallbackMessage: 'Profile update failed. Please try again.' },
    );
  },

  // Change password
  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    apiPost(
      '/auth/change-password',
      { current_password: currentPassword, new_password: newPassword },
      'Password change failed',
    ),

  // Delete user account
  deleteAccount: async (): Promise<void> => {
    try {
      await apiRequest('/auth/delete', { method: 'DELETE' }, 'Account deletion failed');
      // Remove token after successful deletion
      secureTokenStorage.removeToken();
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  }
};
