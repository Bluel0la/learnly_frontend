// Base URL for API requests
export const API_BASE_URL = 'https://learnly-lgx7.onrender.com/api/v1';

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
  first_name: string;
  last_name: string;
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

// Chat related types
export interface ChatSession {
  chat_id: string;
  chat_title: string;
  created_at: string;
}

export interface ChatMessage {
  query: string;
  response: string;
  timestamp: string;
}

export interface StartSessionRequest {
  chat_title: string;
}

export interface SendMessageRequest {
  prompt: string;
  chat_id: string;
}

// Image extraction types
export interface ExtractTextResponse {
  text: string;
}

// Helper function to create authenticated headers
const getAuthHeaders = (): HeadersInit => {
  const token = tokenStorage.getToken();
  if (!token) throw new Error('Not authenticated');

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
};

// Authentication API service
export const authApi = {
  // Register a new user
  signup: async (userData: SignupRequest): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(userData),
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Registration failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        throw new Error('Network connection issue. Please check your internet connection and try again.');
      }
      throw error;
    }
  },
  
  // Login a user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(credentials),
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        throw new Error('Network connection issue. Please check your internet connection and try again.');
      }
      throw error;
    }
  },

  // Logout a user
  logout: async (): Promise<void> => {
    try {
      const token = tokenStorage.getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Logout error:', errorData);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token from storage, even if request fails
      tokenStorage.removeToken();
    }
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch profile');
      }

      return response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: ProfileUpdateRequest): Promise<UserProfile> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Profile update failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  // Delete user account
  deleteAccount: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/delete`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Account deletion failed');
      }
      
      // Remove token after successful deletion
      tokenStorage.removeToken();
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  }
};

// Token management
export const tokenStorage = {
  setToken: (token: string): void => {
    localStorage.setItem('learnly_auth_token', token);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('learnly_auth_token');
  },
  
  removeToken: (): void => {
    localStorage.removeItem('learnly_auth_token');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('learnly_auth_token');
  }
};

// Chat API service
export const chatApi = {
  // Start a new chat session
  startSession: async (data: StartSessionRequest): Promise<ChatSession> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/start-session`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to start chat session');
      }

      return response.json();
    } catch (error) {
      console.error('Start session error:', error);
      throw error;
    }
  },

  // Send a message in a chat session
  sendMessage: async (data: SendMessageRequest): Promise<ChatMessage> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/send-message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to send message');
      }

      return response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Get all messages in a chat session
  getSessionMessages: async (chatId: string): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/session/${chatId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch chat messages');
      }

      return response.json();
    } catch (error) {
      console.error('Fetch chat messages error:', error);
      throw error;
    }
  },

  // Get all chat sessions for a user
  getSessions: async (): Promise<ChatSession[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'GET',
        headers: getAuthHeaders(),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch chat sessions');
      }

      return response.json();
    } catch (error) {
      console.error('Fetch chat sessions error:', error);
      throw error;
    }
  },

  // Extract text from image
  extractText: async (file: File): Promise<ExtractTextResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/chat/extract-text/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenStorage.getToken()}`,
          'Accept': 'application/json',
        },
        body: formData,
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to extract text from image');
      }

      return response.json();
    } catch (error) {
      console.error('Extract text error:', error);
      throw error;
    }
  }
};
