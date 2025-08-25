import DOMPurify from 'dompurify';

// Enhanced input validation with security focus
export const secureInputValidation = {
  // Validate and sanitize email
  validateEmail: (email: string): { isValid: boolean; sanitized: string; errors: string[] } => {
    const errors: string[] = [];
    const trimmed = email.trim();
    
    // Length validation
    if (trimmed.length === 0) {
      errors.push('Email is required');
    } else if (trimmed.length > 254) {
      errors.push('Email is too long');
    }
    
    // Sanitize input
    const sanitized = DOMPurify.sanitize(trimmed.toLowerCase(), { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
    
    // Email format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (sanitized && !emailRegex.test(sanitized)) {
      errors.push('Invalid email format');
    }
    
    // Check for potential injection attempts
    if (sanitized !== trimmed.toLowerCase()) {
      errors.push('Email contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  },

  // Enhanced password validation
  validatePassword: (password: string): { isValid: boolean; errors: string[]; strength: number } => {
    const errors: string[] = [];
    let strength = 0;
    
    // Length validation
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (password.length >= 8) {
      strength += 1;
    }
    
    if (password.length >= 12) {
      strength += 1;
    }
    
    // Character requirements
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      strength += 1;
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      strength += 1;
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      strength += 1;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      strength += 1;
    }
    
    // Check for common patterns
    const commonPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123456|abcdef|qwerty/i, // Common sequences
      /password|admin|user/i // Common words
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains common patterns');
      strength = Math.max(0, strength - 2);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.min(5, strength) // Cap at 5
    };
  },

  // Sanitize text input with comprehensive protection
  sanitizeText: (text: string, maxLength: number = 1000): { sanitized: string; truncated: boolean } => {
    if (!text) return { sanitized: '', truncated: false };
    
    const trimmed = text.trim();
    const truncated = trimmed.length > maxLength;
    const truncatedText = trimmed.substring(0, maxLength);
    
    const sanitized = DOMPurify.sanitize(truncatedText, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: []
    });
    
    return { sanitized, truncated };
  },

  // Validate file uploads with security checks
  validateFile: (
    file: File, 
    allowedTypes: string[], 
    maxSize: number
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Type validation
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    
    // Size validation
    if (file.size > maxSize) {
      errors.push(`File size ${Math.round(file.size / 1024)}KB exceeds limit of ${Math.round(maxSize / 1024)}KB`);
    }
    
    // Name validation (prevent directory traversal)
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push('Invalid file name');
    }
    
    // Extension validation
    const extension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
    if (extension && !allowedExtensions.includes(extension)) {
      errors.push('File extension does not match type');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate URLs
  validateUrl: (url: string): { isValid: boolean; sanitized: string; errors: string[] } => {
    const errors: string[] = [];
    
    if (!url) {
      errors.push('URL is required');
      return { isValid: false, sanitized: '', errors };
    }
    
    const sanitized = DOMPurify.sanitize(url.trim(), { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
    
    try {
      const urlObj = new URL(sanitized);
      
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('Only HTTP and HTTPS URLs are allowed');
      }
      
      // Prevent localhost/private IP access in production
      if (import.meta.env.PROD) {
        const hostname = urlObj.hostname.toLowerCase();
        if (hostname === 'localhost' || 
            hostname.startsWith('127.') || 
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            (hostname.startsWith('172.') && 
             parseInt(hostname.split('.')[1]) >= 16 && 
             parseInt(hostname.split('.')[1]) <= 31)) {
          errors.push('Private network URLs are not allowed');
        }
      }
      
    } catch (e) {
      errors.push('Invalid URL format');
    }
    
    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }
};

// Rate limiting with enhanced security
export class SecureRateLimiter {
  private attempts: Map<string, { 
    count: number; 
    windowStart: number; 
    blocked: boolean;
    suspiciousActivity: number;
  }> = new Map();
  
  isAllowed(
    key: string, 
    maxAttempts: number = 5, 
    windowMs: number = 15 * 60 * 1000,
    blockDuration: number = 30 * 60 * 1000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.attempts.get(key);
    
    // Check if currently blocked
    if (entry?.blocked && (now - entry.windowStart) < blockDuration) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: entry.windowStart + blockDuration 
      };
    }
    
    // Reset if window expired or was blocked
    if (!entry || (now - entry.windowStart) >= windowMs || entry.blocked) {
      this.attempts.set(key, { 
        count: 1, 
        windowStart: now, 
        blocked: false,
        suspiciousActivity: entry?.suspiciousActivity || 0
      });
      return { 
        allowed: true, 
        remaining: maxAttempts - 1, 
        resetTime: now + windowMs 
      };
    }
    
    // Increment attempts
    entry.count++;
    
    // Block if exceeded
    if (entry.count > maxAttempts) {
      entry.blocked = true;
      entry.suspiciousActivity++;
      
      // Increase block duration for repeated offenders
      const multiplier = Math.min(entry.suspiciousActivity, 5);
      const extendedBlockDuration = blockDuration * multiplier;
      
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: now + extendedBlockDuration 
      };
    }
    
    return { 
      allowed: true, 
      remaining: maxAttempts - entry.count, 
      resetTime: entry.windowStart + windowMs 
    };
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  getAttempts(key: string): number {
    return this.attempts.get(key)?.count || 0;
  }
  
  isSuspicious(key: string): boolean {
    const entry = this.attempts.get(key);
    return (entry?.suspiciousActivity || 0) > 3;
  }
}

export const secureRateLimiter = new SecureRateLimiter();