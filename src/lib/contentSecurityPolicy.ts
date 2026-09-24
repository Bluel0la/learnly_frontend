// Content Security Policy configuration for enhanced security
export const getCSPConfig = () => {
  const isDev = import.meta.env.DEV;
  
  // In development, we need more permissive policies for hot reload
  const devPolicies = {
    'script-src': "'self' 'unsafe-eval' 'unsafe-inline' localhost:* ws://localhost:*",
    'style-src': "'self' 'unsafe-inline' fonts.googleapis.com",
    'connect-src': "'self' ws://localhost:* localhost:* *.lovable.dev vitejs.dev",
  };
  
  // Production policies are much stricter
  const prodPolicies = {
    'script-src': "'self'",
    'style-src': "'self' 'unsafe-inline' fonts.googleapis.com",
    'connect-src': "'self'",
  };
  
  const policies = isDev ? devPolicies : prodPolicies;
  
  return {
    'default-src': "'self'",
    'img-src': "'self' data: blob:",
    'font-src': "'self' fonts.gstatic.com",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'", // Prevent clickjacking
    'upgrade-insecure-requests': !isDev, // Only in production
    ...policies
  };
};

// Generate CSP header string
export const getCSPHeaderValue = (): string => {
  const config = getCSPConfig();
  return Object.entries(config)
    .filter(([_, value]) => value !== false)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
};

// Enhanced security headers
export const getEnhancedSecurityHeaders = (): HeadersInit => {
  const isDev = import.meta.env.DEV;
  
  return {
    // Content Security Policy
    'Content-Security-Policy': getCSPHeaderValue(),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Feature Policy / Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    
    // Strict Transport Security (HTTPS only in production)
    ...(isDev ? {} : {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }),
    
    // Prevent caching of sensitive data
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
};