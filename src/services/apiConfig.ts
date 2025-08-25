
import { secureTokenStorage } from './secureTokenStorage';
import { getEnhancedSecurityHeaders } from '@/lib/contentSecurityPolicy';

// Base URL for API requests
export const API_BASE_URL = 'https://learnly-lgx7.onrender.com/api/v1';

// Helper function to create authenticated headers
export const getAuthHeaders = (): HeadersInit => {
  const token = secureTokenStorage.getToken();
  if (!token) throw new Error('Not authenticated');

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...getEnhancedSecurityHeaders()
  };
};

// Helper function for file upload headers (without Content-Type)
export const getFileUploadHeaders = (): HeadersInit => {
  const token = secureTokenStorage.getToken();
  if (!token) throw new Error('Not authenticated');

  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    ...getEnhancedSecurityHeaders()
  };
};

// Helper function for basic headers
export const getBasicHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...getEnhancedSecurityHeaders()
});
